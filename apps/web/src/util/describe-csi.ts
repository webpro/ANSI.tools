import type { CONTROL_CODE } from "@ansi-tools/parser";
import { codeMaps } from "../codes.ts";
import { getParameters, parameterKey } from "./parameters.ts";

type Description = { sort: string | number; mnemonic: string; description: string };

const modeStates = new Map([
  ["0", "not recognized"],
  ["1", "set"],
  ["2", "reset"],
  ["3", "permanently set"],
  ["4", "permanently reset"],
]);

function modeName(value: string | undefined, dec: boolean): string {
  const key = parameterKey(value);
  const name = dec ? codeMaps.DEC.get(key)?.description : codeMaps.CSI.get("h")?.params?.[key];
  return typeof name === "string" ? name : `unknown ${dec ? "DEC" : "ANSI"} mode: ${key || "unspecified"}`;
}

function describeCommand(command: string, params: string[]): Description {
  const item = codeMaps.CSI.get(command);
  const sort = `${command}${(params[0] || "0").padStart(3, "0")}`;
  if (!item) return { sort, mnemonic: "", description: `unknown CSI sequence: ${command}` };

  let description = item.description;
  if (command === "h" || command === "l") {
    if (params.length) {
      description +=
        ": " +
        params
          .map(value => {
            const key = parameterKey(value);
            return item.params?.[key] ?? `unknown ANSI mode: ${key || "unspecified"}`;
          })
          .join(", ");
    }
  } else if (command === "$p" || command === "?$p" || command === "$y" || command === "?$y") {
    description += `: ${modeName(params[0], command[0] === "?")}`;
    if (command.endsWith("y")) {
      const state = parameterKey(params[1]);
      description += `: ${modeStates.get(state) ?? `unknown status: ${state || "unspecified"}`}`;
    }
  } else if (command === "?s") {
    if (params.length) description += `: ${params.map(value => modeName(value, true)).join(", ")}`;
  } else if (command === "?r" || command === "?c") {
    if (params.length) description += `: ${params.join(";")}`;
  } else if (command === ">c") {
    if (params.length === 0 || (params.length === 1 && (parameterKey(params[0]) || "0") === "0")) {
      description += " request";
    } else if (
      params.length === 3 &&
      params.every(value => value !== "" && Number.isSafeInteger(Number(value)) && Number(value) >= 0)
    ) {
      description += ` response: ${params.join(";")}`;
    } else {
      description += `: ${params.join(";")}`;
    }
  } else if (command === ">m") {
    if (params.length === 0) {
      description += ": all resources to initial values";
    } else {
      const resource = parameterKey(params[0]) || "0";
      const name = item.params?.[resource] ?? `resource ${resource}`;
      description += `: ${name}${params[1] === undefined || params[1] === "" ? " (initial value)" : ` = ${params[1]}`}`;
    }
  } else if (item.params) {
    const value = params[0] || Object.values(item.defaults ?? {})[0];
    const key = parameterKey(value);
    const name = item.params[key];
    if (typeof name === "string") description += `: ${name}`;
    else if (value !== undefined) description += `: unknown parameter: ${key}`;
    if (params.length > 1) description += ` (${params.slice(1).join(";")})`;
  } else if (item.template && (command !== "s" || params.length)) {
    let index = 0;
    const view = item.template.replace(/<([^>]+)>/g, (_placeholder, name: string) => {
      const value = params[index++];
      if (value === undefined || value === "" || (item.zeroIsDefault && parameterKey(value) === "0")) {
        return item.defaults?.[name] || "unspecified";
      }
      return value;
    });
    description += ` (${view})`;
  }
  return { sort, mnemonic: item.mnemonic ?? "", description };
}

export function describeCSI(code: CONTROL_CODE): Description {
  return describeCommand(code.command, getParameters(code));
}

export function describeDEC(code: CONTROL_CODE): Description {
  const params = getParameters(code);
  if (code.command !== "h" && code.command !== "l") return describeCommand(`?${code.command}`, params);

  const descriptions: string[] = [];
  const mnemonics: string[] = [];
  for (const value of params) {
    const key = parameterKey(value);
    const item = codeMaps.DEC.get(key);
    if (!item) descriptions.push(`unknown DEC mode: ${key || "unspecified"}`);
    else if (item.resetDescription) {
      descriptions.push(code.command === "h" ? item.description : item.resetDescription);
    } else {
      descriptions.push(`${code.command === "h" ? "enable" : "disable"} ${item.description}`);
    }
    if (item?.mnemonic) mnemonics.push(item.mnemonic);
  }
  const first = parameterKey(params[0]);
  const number = Number.parseInt(first, 10);
  return {
    sort: Number.isNaN(number) ? first : number,
    mnemonic: mnemonics.join(", "),
    description: descriptions.length ? descriptions.join("; ") : `${code.command === "h" ? "set" : "reset"} DEC modes`,
  };
}

export function describePRIVATE(code: CONTROL_CODE): Description {
  return { ...describeCommand(code.command, getParameters(code)), sort: code.command };
}
