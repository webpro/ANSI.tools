import type { CONTROL_CODE } from "@ansi-tools/parser";
import { codeMaps } from "../codes.ts";

const progressStates = new Map([
  ["0", "clear"],
  ["1", "in progress"],
  ["2", "error"],
  ["3", "indeterminate"],
  ["4", "paused"],
]);

function specialColor(index: string): string {
  const name = codeMaps.OSC.get("5")?.params?.[index];
  return typeof name === "string" ? `${name} (${index})` : index;
}

function colorAction(value: string | undefined): string {
  if (value === undefined || value === "") return "missing color";
  return value === "?" ? "query" : `set to ${value}`;
}

export function describeOSC(code: CONTROL_CODE): { sort: number; mnemonic: string; description: string } {
  const { command, params } = code;
  const item = codeMaps.OSC.get(command);
  const sort = Number.parseInt(command, 10);
  let description = item?.description ?? `unknown OSC command: ${command}`;

  if (command === "8" && params.length >= 2) {
    const url = params.slice(1).join(";");
    description = url ? `hyperlink: ${url}` : "hyperlink (end)";
  } else if (command === "52" && params.length >= 2) {
    const targets = params[0] || "terminal default";
    const data = params.slice(1).join(";");
    const action = data === "?" ? "query" : data === "" ? "clear" : "write/clear";
    description = `${action} clipboard data (targets: ${targets})`;
  } else if (command === "9") {
    const state = params[0] === "4" ? progressStates.get(params[1]) : undefined;
    if (state) {
      const percentage = (params[1] === "1" || params[1] === "2" || params[1] === "4") && params[2];
      description = `ConEmu progress: ${state}${percentage ? ` (${percentage}%)` : ""}`;
    } else if (params.length) description += `: ${params.join(";")}`;
  } else if (command === "22" && params.length) {
    description += `: ${params.join(";")}`;
  } else if ((command === "4" || command === "5") && params.length) {
    const changes: string[] = [];
    for (let i = 0; i < params.length; i += 2) {
      const target = command === "4" ? `palette color ${params[i]}` : `special color ${specialColor(params[i])}`;
      changes.push(`${target}: ${colorAction(params[i + 1])}`);
    }
    description = changes.join("; ");
  } else if ((command === "6" || command === "106") && params.length >= 2) {
    const flag = Number(params[1]);
    if (Number.isInteger(flag) && flag >= 0) {
      description = `${flag === 0 ? "disable" : "enable"} special color ${specialColor(params[0])}`;
    }
  } else if (command === "104" || command === "105") {
    const kind = command === "104" ? "palette" : "special";
    description = params.length
      ? `reset ${kind} colors: ${params.map(index => (command === "104" ? index : specialColor(index))).join(", ")}`
      : `reset all ${kind} colors`;
  } else if (item && sort >= 10 && sort <= 19 && params.length) {
    const changes: string[] = [];
    for (let i = 0; i < params.length; i++) {
      const target = sort + i;
      const color = target <= 19 ? codeMaps.OSC.get(String(target)) : undefined;
      changes.push(color ? `${color.description}: ${colorAction(params[i])}` : `extra color data: ${params[i]}`);
    }
    description = changes.join("; ");
  }

  return { sort, mnemonic: item?.mnemonic ?? "", description };
}
