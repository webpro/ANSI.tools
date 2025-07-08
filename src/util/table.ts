import { AnsiUp } from "ansi_up";
import { sgrMap, csiMap, oscMap, decMap, escMap, ansiCodes } from "../codes.ts";
import { escapeHtmlEntities } from "./string.ts";

interface TableRow {
  type: "SGR" | "CSI" | "OSC" | "DEC" | "ESC";
  code: string;
  sort: string | number;
  mnemonic: string;
  description: string;
}

interface LookupTableRow extends TableRow {
  example: string;
}

type Match = Omit<TableRow, "type" | "code">;

const convert = new AnsiUp();

const ESC_LITERAL = "(?:\\\\u001[bB]|\\\\x1[bB]|\\\\033|\\\\e)";
const CSI_LITERAL_INTRO = `(?:${ESC_LITERAL}\\[|(?:\\\\u009b))`;
const OSC_LITERAL_INTRO = `${ESC_LITERAL}\\]`;
const OSC_LITERAL_TERMINATOR = `(?:\\\\u0007|\\\\a|\\\\x07|${ESC_LITERAL}\\\\)`;

const ANSI_LITERAL_REGEX = new RegExp(
  [
    `(?:${CSI_LITERAL_INTRO})(?<csiParams>[?0-9;]*)?(?<csiLastChar>[@-~])`,
    `(?:${OSC_LITERAL_INTRO})(?<oscCommand>.*?)(?:${OSC_LITERAL_TERMINATOR})`,
    `(?<esc>${ESC_LITERAL})(?<escCode>[a-zA-Z])`,
  ].join("|"),
  "g"
);

const typeOrder: Record<TableRow["type"], number> = { SGR: 1, CSI: 2, OSC: 3, DEC: 4, ESC: 5 };

export function sortControlCodes<T extends TableRow | LookupTableRow>(rows: T[]): T[] {
  return rows.toSorted((a, b) => {
    const typeComparison = typeOrder[a.type] - typeOrder[b.type];
    if (typeComparison !== 0) return typeComparison;
    if (typeof a.sort === "number" && typeof b.sort === "number") return a.sort - b.sort;
    if (!a.sort) return 1;
    if (!b.sort) return -1;
    return a.sort.toString().localeCompare(b.sort.toString());
  });
}

function handleSGR(csiParams: string): Match {
  const value = csiParams || "0";
  const sgrParams = value.split(";").filter(Boolean);
  if (sgrParams.length === 0) {
    sgrParams.push("0");
  }

  const descriptions: string[] = [];
  const paramsIterator = sgrParams[Symbol.iterator]();
  let current = paramsIterator.next();

  while (!current.done) {
    const param = current.value;
    const item = sgrMap.get(param);

    if (item) {
      descriptions.push(item.description);
    } else if (param === "38" || param === "48") {
      const colorType = param === "38" ? "fg color" : "bg color";
      const colorMode = paramsIterator.next().value;
      if (colorMode === "5") {
        const color = paramsIterator.next().value;
        descriptions.push(`${colorType}: 8-bit #${color}`);
      } else if (colorMode === "2") {
        const r = paramsIterator.next().value;
        const g = paramsIterator.next().value;
        const b = paramsIterator.next().value;
        descriptions.push(`${colorType}: 24-bit rgb(${r}, ${g}, ${b})`);
      }
    } else {
      descriptions.push(`unknown SGR parameter: ${param}`);
    }
    current = paramsIterator.next();
  }
  const sort = sgrParams.length > 1 ? Number(sgrParams[0]) + Number(sgrParams[1]) / 10 : Number(sgrParams[0]);
  return { sort, mnemonic: "", description: descriptions.join(", ") };
}

function handleDEC(csiParams: string, csiLastChar: string): Match {
  const value = csiParams.substring(1);
  const item = decMap.get(value);
  const action = csiLastChar === "h" ? "enable" : "disable";
  const description = item ? `${action} ${item.description}` : `${action} private mode ${value}`;
  return { sort: Number(value), mnemonic: item?.mnemonic ?? "", description };
}

function handleCSI(csiParams: string, csiLastChar: string): Match {
  const item = csiMap.get(csiLastChar);
  let description = `unknown CSI sequence (${csiParams}${csiLastChar})`;
  if (item) {
    description = item.description;
    if (item.params && item.params[csiParams] !== undefined) {
      description += `: ${item.params[csiParams]}`;
    }
  }
  const sort = csiParams ? Number.parseInt(csiParams.split(";")[0], 10) : csiLastChar.toLowerCase();
  return { sort, mnemonic: item?.mnemonic || "", description };
}

function handleOSC(oscCommand: string): Match {
  const [code, _text, value] = oscCommand.split(";");
  const item = oscMap.get(code);
  const description = item
    ? code === "8" && value
      ? `hyperlink: ${value}`
      : code === "8"
        ? "hyperlink (end)"
        : item.description
    : `unknown OSC command: ${oscCommand}`;
  return { sort: value, mnemonic: item?.mnemonic ?? "", description };
}

function handleESC(escCode: string): Match {
  const item = escMap.get(escCode);
  const description = item ? item.description : `unknown escape sequence '${escCode}'`;
  return { sort: escCode, mnemonic: item?.mnemonic || "", description };
}

export function extractControlCodes(text: string): TableRow[] {
  const matches = text.matchAll(ANSI_LITERAL_REGEX);
  return Array.from(matches, (match): TableRow => {
    const { csiParams = "", csiLastChar, oscCommand, escCode } = match.groups ?? {};
    const code = escapeHtmlEntities(match[0]);
    if (csiLastChar === "m") {
      return { type: "SGR", code, ...handleSGR(csiParams) };
    } else if ((csiLastChar === "h" || csiLastChar === "l") && csiParams.startsWith("?")) {
      return { type: "DEC", code, ...handleDEC(csiParams, csiLastChar) };
    } else if (csiLastChar) {
      return { type: "CSI", code, ...handleCSI(csiParams, csiLastChar) };
    } else if (oscCommand) {
      return { type: "OSC", code, ...handleOSC(oscCommand) };
    } else if (escCode) {
      return { type: "ESC", code, ...handleESC(escCode) };
    } else {
      return { type: "CSI", code, sort: "unknown", mnemonic: "", description: "unknown" };
    }
  });
}

function tpl(template?: string, example?: { [key: string]: string }) {
  if (!template) return "";
  if (!example) return template;
  return template.replace(/<([^>]+)>/g, (_, varName) => example[varName]);
}

export function createRowsFromCodes() {
  const PREFIX = "ESC";
  const PREFIX_RAW = "\u001b";
  const PREFIX_RAW_ESCAPED = "\\u001b";
  const SUFFIX_RAW = "\\u0007";

  const rows: LookupTableRow[] = [];

  for (const data of ansiCodes) {
    const type = data.type;
    switch (type) {
      case "SGR": {
        const { description, template } = data;
        const code = `${PREFIX}[${data.code}${template ?? ""}m`;
        const raw = `${PREFIX_RAW}[${data.code}${tpl(data.template, data.example)}m`;
        const sgr = Number.parseInt(data.code.split(";")[0], 10);
        const isBgColor = (sgr >= 40 && sgr <= 49) || (sgr >= 100 && sgr <= 107) || data.code.startsWith("48;");
        const text = isBgColor ? "\u00A0\u00A0\u00A0\u00A0\u00A0" : "Sample";
        const example = convert.ansi_to_html(`${raw}${text}\u001b[0m`);
        rows.push({ type, sort: data.code, code, mnemonic: "", description, example });
        break;
      }

      case "CSI": {
        const { params, mnemonic, description, template } = data;
        if (params) {
          for (const [param, desc] of Object.entries(params)) {
            const code = `${PREFIX}[${param}${data.code}`;
            rows.push({ type, sort: data.code, code, mnemonic, description: `${description}: ${desc}`, example: "" });
          }
        } else {
          const code = `${PREFIX}[${template ?? ""}${data.code}`;
          rows.push({ type, sort: data.code, code, mnemonic, description, example: "" });
        }
        break;
      }

      case "OSC": {
        const { mnemonic, description, template, end } = data;
        const code = `${PREFIX}]${data.code}${template ?? ""}ST`;
        const example = `${PREFIX_RAW_ESCAPED}` + `]${data.code}${tpl(template, data.example)}${SUFFIX_RAW}`;
        rows.push({ type, sort: Number(data.code), code, mnemonic, description, example });

        if (end) {
          const code = `${PREFIX}]${data.code}${end.template ?? ""}ST`;
          rows.push({ type, sort: Number(data.code), code, mnemonic, description: end.description, example: "" });
        }
        break;
      }

      case "DEC": {
        const shared = { type, sort: data.code, mnemonic: data.mnemonic ?? "", example: "" };
        rows.push({ ...shared, code: `${PREFIX}[?${data.code}h`, description: `enable ${data.description}` });
        rows.push({ ...shared, code: `${PREFIX}[?${data.code}l`, description: `disable ${data.description}` });
        break;
      }

      case "ESC": {
        const { code, mnemonic, description } = data;
        rows.push({ type, sort: code, code: `${PREFIX}${code}`, mnemonic, description, example: "" });
        break;
      }
    }
  }

  return rows;
}
