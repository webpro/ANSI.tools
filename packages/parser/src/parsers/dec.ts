import { CODE_TYPES } from "../constants.ts";
import type { CONTROL_CODE } from "../types.ts";

export function parseDEC(pos: number, raw: string, data: string, final: string): CONTROL_CODE {
  const withoutPrefix = data.slice(1);
  let i = 0;
  let paramsRaw = "";
  while (
    i < withoutPrefix.length &&
    ((withoutPrefix.charCodeAt(i) >= 48 && withoutPrefix.charCodeAt(i) <= 57) || withoutPrefix[i] === ";")
  ) {
    paramsRaw += withoutPrefix[i];
    i++;
  }
  const command = withoutPrefix.slice(i) + final;
  const params = [];
  if (paramsRaw) {
    let current = "";
    for (let j = 0; j < paramsRaw.length; j++) {
      if (paramsRaw[j] === ";") {
        params.push(current || "-1");
        current = "";
      } else {
        current += paramsRaw[j];
      }
    }
    params.push(current || "-1");
  }
  return { type: CODE_TYPES.DEC, pos, raw, command, params };
}
