import { CODE_TYPES } from "../constants.ts";
import type { CONTROL_CODE } from "../types.ts";

export function parseCSI(pos: number, raw: string, data: string, final: string): CONTROL_CODE {
  const params = [];
  let intermediates = "";
  if (data) {
    let i = 0;
    let paramSection = "";
    while (i < data.length && data.charCodeAt(i) >= 0x30 && data.charCodeAt(i) <= 0x3f) {
      paramSection += data[i];
      i++;
    }
    intermediates = data.slice(i);
    if (paramSection) {
      let current = "";
      for (let j = 0; j < paramSection.length; j++) {
        if (paramSection[j] === ";") {
          params.push(current || "-1");
          current = "";
        } else {
          current += paramSection[j];
        }
      }
      params.push(current || "-1");
    }
  }
  const command = intermediates + final;
  return { type: CODE_TYPES.CSI, pos, raw, command, params };
}

export function parsePrivateCSI(pos: number, raw: string, data: string, final: string): CONTROL_CODE {
  const privateIndicator = data[0];
  const withoutIndicator = data.slice(1);
  const match = withoutIndicator.match(/^([\d;]*)(.*)/);
  const paramsRaw = match?.[1] ?? "";
  const intermediates = match?.[2] ?? "";
  const command = `${privateIndicator}${intermediates}${final}`;
  const params = [];
  if (paramsRaw) {
    let current = "";
    for (let i = 0; i < paramsRaw.length; i++) {
      if (paramsRaw[i] === ";") {
        params.push(current || "-1");
        current = "";
      } else {
        current += paramsRaw[i];
      }
    }
    params.push(current || "-1");
  }

  return { type: CODE_TYPES.PRIVATE, pos, raw, command, params };
}
