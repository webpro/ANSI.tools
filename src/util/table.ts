import { CODE_TYPES } from "@ansi-tools/parser";
import type { CODE, CONTROL_CODE } from "@ansi-tools/parser";
import { sgrMap, csiMap, oscMap, decMap, escMap, dcsMap, stringMap, privateMap, controlCodes } from "../codes.ts";
import { ansiToPre } from "ansi-to-pre";

interface TableRow {
  type: CONTROL_CODE["type"];
  code: string;
  sort: string | number;
  mnemonic?: string;
  description: string;
}

interface LookupTableRow extends TableRow {
  example: string;
}

type Match = Omit<TableRow, "type" | "code">;

const typeOrder: Record<TableRow["type"], number> = {
  CSI: 2,
  DCS: 7,
  DEC: 3,
  ESC: 6,
  OSC: 5,
  PRIVATE: 4,
  SGR: 1,
  STRING: 8,
};

export function sortControlCodes<T extends TableRow | LookupTableRow>(rows: T[]): T[] {
  return rows.toSorted((a, b) => {
    const typeComparison = typeOrder[a.type] - typeOrder[b.type];
    if (typeComparison !== 0) return typeComparison;
    if (typeof a.sort === "number" && typeof b.sort === "number") return a.sort - b.sort;
    if (typeof a.sort === "string" && typeof b.sort === "string") return a.sort.localeCompare(b.sort);
    if (!a.sort) return 1;
    if (!b.sort) return -1;
    return a.sort.toString().localeCompare(b.sort.toString());
  });
}

function handleSGR(code: CONTROL_CODE): Match {
  const descriptions: string[] = [];
  const paramsIterator = code.params[Symbol.iterator]();
  let current = paramsIterator.next();

  while (!current.done) {
    const rawParam = current.value === "-1" ? "0" : current.value;
    const param = String(Number(rawParam));
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
  const sort = code.params.length > 1 ? Number(code.params[0]) + Number(code.params[1]) / 10 : Number(code.params[0]);
  return { sort, mnemonic: "", description: descriptions.join(", ") };
}

function handleDEC(code: CONTROL_CODE): Match {
  const param = code.params?.[0] || "";
  const command = code.command;
  const item = decMap.get(param.replace(/^\?/, ""));

  let description: string;
  if (!item) {
    description = `unknown DEC mode ${param}`;
  } else if (command === "h") {
    description = `enable ${item.description}`;
  } else if (command === "l") {
    description = `disable ${item.description}`;
  } else {
    description = item.description;
  }

  return { sort: Number(item), mnemonic: item?.mnemonic ?? "", description };
}

function handleCSI(code: CONTROL_CODE): Match {
  const item = csiMap.get(code.command);
  let description = `unknown CSI sequence: ${code.raw}`;
  if (item) {
    description = item.description;
    const param = code.params[0];
    if (item.params && item.params[param] !== undefined) {
      description += `: ${item.params[param]}`;
    } else if (item.template && code.params.length > 0) {
      let view = item.template;
      const params = item.template.match(/<([^>]+)>/g);
      if (params && params.length > 0) {
        for (let i = 0; i < params.length && i < code.params.length; i++) {
          const paramName = params[i].slice(1, -1);
          const rawValue = code.params[i];
          const value = rawValue === "-1" ? (item.defaults?.[paramName] ?? "1") : rawValue || "1";
          view = view.replace(`<${paramName}>`, value);
        }
        description += ` (${view})`;
      }
    }
  }
  const sort = `${code.command}${(code.params?.[0] ?? "0").padStart(3, "0")}`;
  return { sort, mnemonic: item?.mnemonic || "", description };
}

function handleOSC(code: CONTROL_CODE): Match {
  const item = oscMap.get(code.command);
  const url = code.params.length > 1 ? code.params[1] : "";
  const description = item
    ? code.command === "8" && url
      ? `hyperlink: ${url}`
      : code.command === "8"
        ? "hyperlink (end)"
        : item.description
    : `unknown OSC command: ${code.raw}`;
  const sort = Number.parseInt(code.command, 10);
  return { sort, mnemonic: item?.mnemonic ?? "", description };
}

function handleESC(code: CONTROL_CODE): Match {
  const key = code.params?.[0] ? `${code.command}${code.params[0]}` : `${code.command}`;
  const item = escMap.get(key);
  const description = item ? item.description : `unknown escape sequence '${code.command}'`;
  return { sort: code.command, mnemonic: item?.mnemonic || "", description };
}

function handleDCS(code: CONTROL_CODE): Match {
  const item = dcsMap.get(code.command);
  const description = item ? item.description : `device control string`;
  return { sort: code.command, mnemonic: item?.mnemonic ?? "", description };
}

function handleSTR(code: CONTROL_CODE): Match {
  const item = stringMap.get(code.command);
  const description = item ? item.description : `string sequence (${code.command})`;
  return { sort: code.command, mnemonic: item?.mnemonic ?? "", description };
}

function handlePRIVATE(code: CONTROL_CODE): Match {
  const command = code.command;
  const prefix = command[0];
  const item = privateMap.get(prefix);
  const known: Record<string, string> = {
    "<m": "private mouse SGR sequence",
    ">c": "secondary device attributes request",
    ">m": "private SGR sequence",
    ">p": "private mode sequence",
  };
  const key = prefix + command.slice(-1);
  const description = known[key] ?? (item ? `${item.description} (${command})` : `private sequence (${command})`);
  return { sort: command, mnemonic: "", description };
}

export function extractControlCodes(codes: CODE[]): TableRow[] {
  const rows: TableRow[] = [];
  for (const code of codes) {
    if (code.type === "CSI" && code.command === "m") rows.push({ type: "SGR", code: code.raw, ...handleSGR(code) });
    else if (code.type === "CSI") rows.push({ type: "CSI", code: code.raw, ...handleCSI(code) });
    else if (code.type === "DCS") rows.push({ type: "DCS", code: code.raw, ...handleDCS(code) });
    else if (code.type === "DEC") rows.push({ type: "DEC", code: code.raw, ...handleDEC(code) });
    else if (code.type === "ESC") rows.push({ type: "ESC", code: code.raw, ...handleESC(code) });
    else if (code.type === "OSC") rows.push({ type: "OSC", code: code.raw, ...handleOSC(code) });
    else if (code.type === "PRIVATE") rows.push({ type: "PRIVATE", code: code.raw, ...handlePRIVATE(code) });
    else if (code.type === "STRING") rows.push({ type: "STRING", code: code.raw, ...handleSTR(code) });
  }
  return rows;
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

  for (const item of controlCodes) {
    const type = item.type;
    switch (type) {
      case CODE_TYPES.SGR: {
        const { description, template } = item;
        const code = `${PREFIX}[${item.code}${template ?? ""}m`;
        const raw = `${PREFIX_RAW}[${item.code}${tpl(item.template, item.example)}m`;
        const example = item.code.includes(":") ? "" : ansiToPre(`${raw}Sample\u001b[0m`);
        rows.push({ type, sort: item.code, code, mnemonic: "", description, example });
        break;
      }

      case CODE_TYPES.CSI: {
        const { params, mnemonic, description, template } = item;
        if (params) {
          for (const [param, desc] of Object.entries(params)) {
            const code = `${PREFIX}[${param}${item.code}`;
            rows.push({ type, sort: item.code, code, mnemonic, description: `${description}: ${desc}`, example: "" });
          }
        } else {
          const templateParams = template ? (template.match(/<[^>]+>/g)?.join(";") ?? "") : "";
          const code = `${PREFIX}[${templateParams}${item.code}`;
          const example = template && item.example ? `\\u001b[${tpl(template, item.example)}${item.code}` : "";
          rows.push({ type, sort: item.code, code, mnemonic, description, example });
        }
        break;
      }

      case CODE_TYPES.OSC: {
        const { mnemonic, description, template, end } = item;
        const code = `${PREFIX}]${item.code}${template ?? ""}ST`;
        const example =
          template && item.example
            ? `${PREFIX_RAW_ESCAPED}` + `]${item.code}${tpl(template, item.example)}${SUFFIX_RAW}`
            : "";
        rows.push({ type, sort: Number(item.code), code, mnemonic, description, example });

        if (end) {
          const code = `${PREFIX}]${item.code}${end.template ?? ""}ST`;
          rows.push({ type, sort: Number(item.code), code, mnemonic, description: end.description, example: "" });
        }
        break;
      }

      case CODE_TYPES.DEC: {
        const shared = { type, sort: item.code, mnemonic: item.mnemonic ?? "", example: "" };
        rows.push({ ...shared, code: `${PREFIX}[?${item.code}h`, description: `enable ${item.description}` });
        rows.push({ ...shared, code: `${PREFIX}[?${item.code}l`, description: `disable ${item.description}` });
        break;
      }

      case CODE_TYPES.ESC: {
        const { code, mnemonic, description } = item;
        rows.push({ type, sort: code, code: `${PREFIX}${code}`, mnemonic, description, example: "" });
        break;
      }

      case CODE_TYPES.DCS: {
        const { code, mnemonic, description, template } = item;
        const dcsCode = `${PREFIX}P${template ?? ""}${code}ST`;
        const example = template && item.example ? `\\u001bP${tpl(template, item.example)}${code}\\u001b\\\\` : "";
        rows.push({ type, sort: code, code: dcsCode, mnemonic, description, example });
        break;
      }

      case CODE_TYPES.STRING: {
        const { code, mnemonic, description, template } = item;
        let prefix: string;
        if (code === "APC") prefix = "_";
        else if (code === "PM") prefix = "^";
        else if (code === "SOS") prefix = "X";
        else prefix = "_"; // fallback

        const stringCode = `${PREFIX}${prefix}${template ?? ""}ST`;
        const example = template && item.example ? `\\u001b${prefix}${tpl(template, item.example)}\\u001b\\\\` : "";
        rows.push({ type, sort: code, code: stringCode, mnemonic, description, example });
        break;
      }

      case CODE_TYPES.PRIVATE: {
        const { code, mnemonic, description, template } = item;
        const privateCode = `${PREFIX}[${code}${template ?? ""}`;
        const example = template && item.example ? `\\u001b[${code}${tpl(template, item.example)}` : "";
        rows.push({ type, sort: code, code: privateCode, mnemonic, description, example });
        break;
      }
    }
  }

  return rows;
}
