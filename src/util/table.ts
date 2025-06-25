import Convert from "ansi-to-html";
import { controlCodes, privateModes, sgrParameters } from "../codes";
import { escapeHtmlEntities } from "./string";
import { escape, formatCodeForDisplay, unescape } from "./ansi";

interface TableRow {
  code: string;
  raw: string;
  mnemonic: string;
  description: string;
  example: string;
}

const convert = new Convert();

const ESC_LITERAL = "(?:\\\\u001[bB]|\\\\x1[bB]|\\\\033)";
const CSI8_LITERAL = "(?:\\\\u009b)";
const CSI_LITERAL_INTRO = `(?:${ESC_LITERAL}\\[|${CSI8_LITERAL})`;
const OSC_LITERAL_INTRO = `${ESC_LITERAL}\\]`;
const OSC_LITERAL_TERMINATOR = `(?:\\u0007|${ESC_LITERAL}\\\\)`;

const ANSI_LITERAL_REGEX = new RegExp(
  [
    `(?:${CSI_LITERAL_INTRO})([?0-9;]*)?([@-~])`,
    `(?:${OSC_LITERAL_INTRO})(.*?)(${OSC_LITERAL_TERMINATOR})`,
    `(${ESC_LITERAL})([a-zA-Z])`,
  ].join("|"),
  "g",
);

const ANSI_REGEX_FOR_SORTING =
  /(?:\u001b\[|\u009b)([?0-9;nm]*)?([@-~])|\u001b](.*?)(?:\u0007|\u001b\\)|\u001b([a-zA-Z])/;

export function sortAnsiCodes(rows: TableRow[]): TableRow[] {
  return rows.toSorted((a, b) => {
    const matchA = a.raw.match(ANSI_REGEX_FOR_SORTING);
    const matchB = b.raw.match(ANSI_REGEX_FOR_SORTING);

    if (!matchA) return 1;
    if (!matchB) return -1;

    const isCsiA = matchA[2] !== undefined;
    const isCsiB = matchB[2] !== undefined;

    if (isCsiA && !isCsiB) return -1;
    if (!isCsiA && isCsiB) return 1;

    if (isCsiA && isCsiB) {
      const finalCharA = matchA[2];
      const finalCharB = matchB[2];

      const isSgrA = finalCharA === "m";
      const isSgrB = finalCharB === "m";
      if (isSgrA && !isSgrB) return -1;
      if (!isSgrA && isSgrB) return 1;

      if (finalCharA !== finalCharB) {
        return finalCharA.localeCompare(finalCharB);
      }

      let paramsStrA = matchA[1];
      let paramsStrB = matchB[1];

      if (finalCharA === "m" && paramsStrA === undefined) paramsStrA = "0";
      if (finalCharB === "m" && paramsStrB === undefined) paramsStrB = "0";

      const paramsA = (paramsStrA || "").split(";").filter((p) => p);
      const paramsB = (paramsStrB || "").split(";").filter((p) => p);

      const minLength = Math.min(paramsA.length, paramsB.length);
      for (let i = 0; i < minLength; i++) {
        const numA = Number(paramsA[i]);
        const numB = Number(paramsB[i]);

        if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
          if (numA !== numB) {
            return numA - numB;
          }
        } else {
          const strComp = paramsA[i].localeCompare(paramsB[i]);
          if (strComp !== 0) {
            return strComp;
          }
        }
      }

      return paramsA.length - paramsB.length;
    }

    return a.raw.localeCompare(b.raw);
  });
}

export function analyzeAnsi(text: string): TableRow[] {
  const matches = escape(text).matchAll(ANSI_LITERAL_REGEX);
  const rows: TableRow[] = [];

  for (const match of matches) {
    const fullCodeLiteral = match[0];
    const csiParamsStr = match[1];
    const csiFinalChar = match[2];
    let oscCommand = match[3];
    const oscTerminator = match[4];
    const singleEscLiteral = match[5];
    const singleCharCode = match[6];

    if (oscCommand !== undefined) {
      oscCommand = match[0].replace(oscTerminator, "").replace(new RegExp(OSC_LITERAL_INTRO), "");
    }

    let description = "";
    let example = "";
    let mnemonic = "";
    const fullCodeRaw = unescape(fullCodeLiteral);

    if (csiFinalChar === "m") {
      const params = csiParamsStr ? csiParamsStr.split(";") : ["0"];
      if (params.length === 0) {
        params.push("0");
      }

      const descriptions: string[] = [];
      for (let i = 0; i < params.length; i++) {
        const param = params[i];
        if (param === "38" || param === "48") {
          const type = param === "38" ? "fg" : "bg";
          if (params[i + 1] === "5") {
            descriptions.push(`${type}: 8-bit color ${params[i + 2]}`);
            i += 2;
          } else if (params[i + 1] === "2") {
            descriptions.push(`${type}: 24-bit color rgb(${params[i + 2]}, ${params[i + 3]}, ${params[i + 4]})`);
            i += 4;
          }
        } else {
          descriptions.push(sgrParameters[param].description || `unknown sgr: ${param}`);
        }
      }
      description = descriptions.join(", ");

      let isBackgroundColor = false;
      for (let i = 0; i < params.length; i++) {
        const param = params[i];
        if (param === "38") {
          if (params[i + 1] === "5") {
            i += 2;
          } else if (params[i + 1] === "2") {
            i += 4;
          }
        } else if (param === "48") {
          isBackgroundColor = true;
          break;
        } else {
          const code = Number.parseInt(param, 10);
          if ((code >= 40 && code <= 47) || (code >= 100 && code <= 107)) {
            isBackgroundColor = true;
            break;
          }
        }
      }

      const sampleText = isBackgroundColor ? "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" : "Sample";
      example = convert.toHtml(`${fullCodeRaw.replace(/\u009b/g, "\u001b[")}${sampleText}\u001b[0m`);
    } else if (csiFinalChar) {
      const codeInfo = controlCodes[csiFinalChar];
      const params = csiParamsStr || "";
      if (codeInfo) {
        mnemonic = codeInfo.mnemonic || "";

        if ((csiFinalChar === "h" || csiFinalChar === "l") && params.startsWith("?")) {
          const mode = params.substring(1);
          const modeDescription = privateModes[mode]?.description;
          const action = csiFinalChar === "h" ? "enable" : "disable";
          if (modeDescription) {
            description = `${action} ${modeDescription}`;
          } else {
            description = `${action} Private Mode ${mode}`;
          }
        } else {
          description = codeInfo.description;
          if (codeInfo.params && codeInfo.params[params] !== undefined) {
            description += `: ${codeInfo.params[params]}`;
          } else if (params) {
            description += ` (${params})`;
          }
        }
      } else {
        description = `unknown csi sequence (terminator '${csiFinalChar}')`;
      }
      example = "<span>N/A</span>";
    } else if (oscCommand !== undefined) {
      mnemonic = "OSC";
      description = oscCommand;
      example = "<span>N/A</span>";
    } else if (singleCharCode) {
      const codeInfo = controlCodes[singleCharCode];
      if (codeInfo) {
        mnemonic = codeInfo.mnemonic || "";
        description = codeInfo.description;
      } else {
        description = `unknown control character '${singleCharCode}'`;
      }
      example = "<span>N/A</span>";
    }

    rows.push({
      code: escapeHtmlEntities(fullCodeLiteral),
      raw: fullCodeRaw,
      mnemonic,
      description,
      example: example,
    });
  }

  return rows;
}

export function getAllKnownCodes(): TableRow[] {
  const convert = new Convert();
  const rows: TableRow[] = [];

  for (const key in sgrParameters) {
    const fullCode = `\u001b[${key}m`;
    const description = sgrParameters[key].description;
    const isBgColor = (Number(key) >= 40 && Number(key) <= 49) || (Number(key) >= 100 && Number(key) <= 107);
    const sampleText = isBgColor ? "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" : "Sample";
    const exampleAnsiString = `${fullCode}${sampleText}\u001b[0m`;
    rows.push({
      code: formatCodeForDisplay(fullCode),
      raw: fullCode,
      mnemonic: "",
      description,
      example: convert.toHtml(exampleAnsiString),
    });
  }

  for (const key in controlCodes) {
    const info = controlCodes[key];
    const mnemonic = info.mnemonic || "";

    const isCsi = key !== "c";

    if (isCsi) {
      if (info.params) {
        for (const param in info.params) {
          const fullCode = `\u001b[${param}${key}`;
          const description = `${info.description}: ${info.params[param]}`;
          rows.push({
            code: formatCodeForDisplay(fullCode),
            raw: fullCode,
            mnemonic,
            description,
            example: "<span>N/A</span>",
          });
        }
      } else {
        let fullCode: string;
        let description = info.description;

        if ("Hf".includes(key)) {
          fullCode = `\u001b[n;m${key}`;
          description = `${info.description} (to row n, column m)`;
        } else if ("ABCDEFGST".includes(key)) {
          fullCode = `\u001b[n${key}`;
          description = `${info.description} (by n lines/columns)`;
        } else {
          fullCode = `\u001b[${key}`;
        }

        rows.push({
          code: formatCodeForDisplay(fullCode),
          raw: fullCode,
          mnemonic,
          description,
          example: "<span>N/A</span>",
        });
      }
    } else {
      const fullCode = `\u001b${key}`;
      rows.push({
        code: formatCodeForDisplay(fullCode),
        raw: fullCode,
        mnemonic,
        description: info.description,
        example: "<span>N/A</span>",
      });
    }
  }

  for (const key in privateModes) {
    const { description, mnemonic } = privateModes[key];
    for (const action of ["h", "l"]) {
      const fullCode = `\u001b[?${key}${action}`;
      const actionDesc = action === "h" ? "enable" : "disable";
      rows.push({
        code: formatCodeForDisplay(fullCode),
        raw: fullCode,
        mnemonic: mnemonic ?? (action === "h" ? "DECSET" : "DECRST"),
        description: `${actionDesc} ${description}`,
        example: "<span>N/A</span>",
      });
    }
  }

  return rows;
}
