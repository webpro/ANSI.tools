import type { CONTROL_CODE } from "@ansi-tools/parser";

export function getParameters(code: CONTROL_CODE): string[] {
  return code.parameterGroups?.map(group => group.join(":")) ?? code.params;
}

export function parameterKey(value: string | undefined): string {
  if (value === undefined || value === "") return "";
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? String(number) : value;
}
