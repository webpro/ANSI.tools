import type { CODE, CONTROL_CODE } from "@ansi-tools/parser";
import { CODE_TYPES } from "@ansi-tools/parser";
import { ansiToPre } from "ansi-to-pre";
import { controlCodes, codeMaps } from "../codes.ts";
import { getColorName } from "./color.ts";
import { ESC, ST } from "./string.ts";
import { SGR_MAP, render } from "./sgr-map.ts";
import { getParameters, parameterKey } from "./parameters.ts";
import { describeCSI, describeDEC, describePRIVATE } from "./describe-csi.ts";

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
    if (typeof a.sort === "string" && typeof b.sort === "string")
      return a.sort.localeCompare(b.sort, undefined, { numeric: true });
    if (!a.sort) return 1;
    if (!b.sort) return -1;
    return a.sort.toString().localeCompare(b.sort.toString());
  });
}

function handleSGR(code: CONTROL_CODE): Match {
  const descriptions: string[] = [];
  const params = getParameters(code);
  if (params.length === 0) descriptions.push(codeMaps.SGR.get("0")!.description);

  for (let i = 0; i < params.length; i++) {
    const parts = params[i].split(":");
    const param = parameterKey(parts[0]) || "0";
    if (param === "38" || param === "48" || param === "58") {
      const colorType = param === "38" ? "fg color" : param === "48" ? "bg color" : "underline color";
      const isColon = parts.length > 1;
      const mode = isColon ? parts[1] : params[++i];
      const modeKey = parameterKey(mode);
      if (modeKey === "5") {
        const value = isColon ? parts[2] : params[++i];
        descriptions.push(
          value === undefined || value === ""
            ? `incomplete ${colorType}`
            : `${colorType}: 8-bit ${getColorName(Number(value))} (#${value})`
        );
      } else if (modeKey === "2") {
        const values = isColon
          ? parts.slice(parts.length >= 6 ? 3 : 2, parts.length >= 6 ? 6 : 5)
          : params.slice(i + 1, i + 4);
        if (!isColon) i += 3;
        descriptions.push(
          values.length !== 3 || values.some(value => value === "")
            ? `incomplete ${colorType}`
            : `${colorType}: 24-bit rgb(${values.join(", ")})`
        );
      } else {
        descriptions.push(mode === undefined ? `incomplete ${colorType}` : `unknown ${colorType} format: ${mode}`);
      }
    } else {
      const key = parts.length === 1 ? param : [param, ...parts.slice(1).map(parameterKey)].join(":");
      descriptions.push(codeMaps.SGR.get(key)?.description ?? `unknown SGR parameter: ${key}`);
    }
  }
  return { sort: buildSgrSortKey(params), mnemonic: "", description: descriptions.join(", ") };
}
function parseSgrParamValue(segment: string): number {
  const value = Number.parseInt(segment, 10);
  return Number.isNaN(value) ? 0 : value;
}

function normalizeSgrParams(params: readonly string[]): number[] {
  const values: number[] = [];
  for (const param of params) {
    if (param === undefined) continue;
    const parts = param.split(":");
    for (const part of parts) values.push(parseSgrParamValue(part));
  }

  if (values.length === 0) return [0];

  values.sort((a, b) => b - a);
  return values;
}

function buildSgrSortKey(params: readonly string[]): string {
  const normalized = normalizeSgrParams(params);
  return normalized.map(value => value.toString().padStart(4, "0")).join(" ");
}

function handleOSC(code: CONTROL_CODE): Match {
  const item = codeMaps.OSC.get(code.command);
  const url = code.params.length > 1 ? code.params[1] : "";
  const description = item
    ? code.command === "8" && url
      ? `hyperlink: ${url}`
      : code.command === "8"
        ? "hyperlink (end)"
        : item.description
    : `unknown OSC command: ${code.command}`;
  const sort = Number.parseInt(code.command, 10);
  return { sort, mnemonic: item?.mnemonic ?? "", description };
}

function handleESC(code: CONTROL_CODE): Match {
  const key = code.params?.[0] ? `${code.command}${code.params[0]}` : `${code.command}`;
  const item = codeMaps.ESC.get(key);
  const description = item ? item.description : "unknown escape sequence";
  return { sort: code.command, mnemonic: item?.mnemonic || "", description };
}

function handleDCS(code: CONTROL_CODE): Match {
  const item = codeMaps.DCS.get(code.command);
  const description = item ? item.description : `device control string`;
  return { sort: code.command, mnemonic: item?.mnemonic ?? "", description };
}

function handleSTR(code: CONTROL_CODE): Match {
  const item = codeMaps.STRING.get(code.command);
  const description = item ? item.description : `string sequence (${code.command})`;
  return { sort: code.command, mnemonic: item?.mnemonic ?? "", description };
}

export function extractControlCodes(codes: CODE[]): TableRow[] {
  const rows: TableRow[] = [];
  for (const code of codes) {
    if (code.type === "CSI" && code.command === "m") rows.push({ type: "SGR", code: code.raw, ...handleSGR(code) });
    else if (code.type === "CSI") rows.push({ type: "CSI", code: code.raw, ...describeCSI(code) });
    else if (code.type === "DCS") rows.push({ type: "DCS", code: code.raw, ...handleDCS(code) });
    else if (code.type === "DEC") rows.push({ type: "DEC", code: code.raw, ...describeDEC(code) });
    else if (code.type === "ESC") rows.push({ type: "ESC", code: code.raw, ...handleESC(code) });
    else if (code.type === "OSC") rows.push({ type: "OSC", code: code.raw, ...handleOSC(code) });
    else if (code.type === "PRIVATE") rows.push({ type: "PRIVATE", code: code.raw, ...describePRIVATE(code) });
    else if (code.type === "STRING") rows.push({ type: "STRING", code: code.raw, ...handleSTR(code) });
  }
  return rows;
}

function tpl(template?: string, example?: { [key: string]: string }) {
  if (!template) return "";
  if (!example) return template;
  return template.replace(/<([^>]+)>/g, (_, name) => example[name]);
}

function csiSequence(command: string, parameters: string): string {
  const prefix = "?<=>".includes(command[0]) ? command[0] : "";
  return `${prefix}${parameters}${command.slice(prefix.length)}`;
}

export function createRowsFromCodes() {
  const PREFIX = ESC;
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
        const raw = `${PREFIX_RAW}[${item.code}${tpl(template, item.example)}m`;
        const example = item.code in SGR_MAP ? render(SGR_MAP[item.code]) : ansiToPre(`${raw}Sample\u001b[0m`);
        rows.push({ type, sort: item.code, code, mnemonic: "", description, example });
        break;
      }

      case CODE_TYPES.CSI: {
        const { params, mnemonic, description, template } = item;
        if (params) {
          for (const [param, desc] of Object.entries(params)) {
            const code = `${PREFIX}[${csiSequence(item.code, param)}`;
            rows.push({ type, sort: item.code, code, mnemonic, description: `${description}: ${desc}`, example: "" });
          }
        } else {
          const templateParams = template ? (template.match(/<[^>]+>/g)?.join(";") ?? "") : "";
          const code = `${PREFIX}[${csiSequence(item.code, templateParams)}`;
          const example =
            template && item.example ? `\\u001b[${csiSequence(item.code, tpl(templateParams, item.example))}` : "";
          rows.push({ type, sort: item.code, code, mnemonic, description, example });
        }
        break;
      }

      case CODE_TYPES.OSC: {
        const { mnemonic, description, template, end } = item;
        const code = `${PREFIX}]${item.code}${template ?? ""}${ST}`;
        const example =
          template && item.example
            ? `${PREFIX_RAW_ESCAPED}` + `]${item.code}${tpl(template, item.example)}${SUFFIX_RAW}`
            : "";
        rows.push({ type, sort: Number(item.code), code, mnemonic, description, example });

        if (end) {
          const code = `${PREFIX}]${item.code}${end.template ?? ""}${ST}`;
          rows.push({ type, sort: Number(item.code), code, mnemonic, description: end.description, example: "" });
        }
        break;
      }

      case CODE_TYPES.DEC: {
        const shared = { type, sort: item.code, mnemonic: item.mnemonic ?? "", example: "" };
        rows.push({
          ...shared,
          code: `${PREFIX}[?${item.code}h`,
          description: item.resetDescription ? item.description : `enable ${item.description}`,
        });
        rows.push({
          ...shared,
          code: `${PREFIX}[?${item.code}l`,
          description: item.resetDescription ?? `disable ${item.description}`,
        });
        break;
      }

      case CODE_TYPES.ESC: {
        const { code, mnemonic, description } = item;
        rows.push({ type, sort: code, code: `${PREFIX}${code}`, mnemonic, description, example: "" });
        break;
      }

      case CODE_TYPES.DCS: {
        const { code, mnemonic, description, template, header } = item;
        const dcsCode = `${PREFIX}P${header ?? ""}${code}${template ?? ""}${ST}`;
        const example = item.example
          ? `\\u001bP${tpl(header, item.example)}${code}${tpl(template, item.example)}\\u001b\\\\`
          : "";
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

        const stringCode = `${PREFIX}${prefix}${template ?? ""}${ST}`;
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
