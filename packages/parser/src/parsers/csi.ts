import { CODE_TYPES, PRIVATE_OPENERS } from "../constants.ts";
import type { CODE, CONTROL_CODE_TYPE, TOKEN } from "../types.ts";

export function parseCSI(introducer: TOKEN, dataTokens: TOKEN[], final: TOKEN | undefined): CODE {
  const data = dataTokens.length === 1 ? dataTokens[0].raw : dataTokens.length === 0 ? "" : dataTokens.map(t => t.raw).join("");
  const finalRaw = final?.raw ?? "";
  const raw = introducer.raw + data + finalRaw;
  const params: string[] = [];

  let type: CONTROL_CODE_TYPE = CODE_TYPES.CSI;
  let paramEnd = 0;

  if (data) {
    while (paramEnd < data.length) {
      const charCode = data.charCodeAt(paramEnd);
      if (charCode < 0x30 || charCode > 0x3f) break;
      paramEnd++;
    }
  }

  const paramSection = paramEnd > 0 ? data.substring(0, paramEnd) : "";
  const intermediates = paramEnd < data.length ? data.substring(paramEnd) : "";

  if (paramSection) {
    let start = 0;
    for (let i = 0; i <= paramSection.length; i++) {
      if (i === paramSection.length || paramSection.charCodeAt(i) === 0x3b || paramSection.charCodeAt(i) === 0x3a) {
        params.push(i > start ? paramSection.substring(start, i) : "0");
        start = i + 1;
      }
    }
  }

  const command = intermediates + finalRaw;
  const first = params[0];

  if (first !== undefined && first.charCodeAt(0) === 0x3f) {
    type = CODE_TYPES.DEC;
    if (first.length > 1) params[0] = first.substring(1);
    else params.shift();
    return { type, pos: introducer.pos, raw, command, params };
  }

  for (const param of params) {
    if (param.length > 0 && PRIVATE_OPENERS.has(param[0])) {
      type = CODE_TYPES.PRIVATE;
      const privateCommand = param[0] + command;

      for (let i = 0; i < params.length; i++) {
        if (params[i].length > 0 && PRIVATE_OPENERS.has(params[i][0])) {
          if (params[i].length > 1) {
            params[i] = params[i].substring(1);
          } else {
            params.splice(i, 1);
          }
          break;
        }
      }

      return { type, pos: introducer.pos, raw, command: privateCommand, params };
    }
  }

  if (command === "m" && params.length === 5 && params[1] === "2" && (first === "38" || first === "48")) {
    params.splice(2, 0, "0");
  }

  if (command === "r" && params.length === 2 && params[1] === "0") {
    params[1] = "-1";
  }

  return { type, pos: introducer.pos, raw, command, params };
}
