import { CODE_TYPES, PARAM_SEPARATOR, PRIVATE_OPENERS } from "../constants.ts";
import type { CODE, CONTROL_CODE_TYPE, TOKEN } from "../types.ts";

export function parseCSI(introducer: TOKEN, dataTokens: TOKEN[], final: TOKEN | undefined): CODE {
  const data = dataTokens.map(t => t.raw).join("");
  const raw = introducer.raw + data + (final?.raw || "");
  const params = [];

  let type: CONTROL_CODE_TYPE = CODE_TYPES.CSI;
  let intermediates = "";
  let paramSection = "";

  if (data) {
    let i = 0;
    while (i < data.length) {
      const charCode = data.charCodeAt(i);
      if (charCode >= 0x30 && charCode <= 0x3f) {
        paramSection += data[i];
        i++;
      } else {
        break;
      }
    }
    intermediates = data.slice(i);
  }

  if (paramSection) {
    for (const part of paramSection.split(PARAM_SEPARATOR)) {
      params.push(part || "0");
    }
  }

  const command = intermediates + (final?.raw ?? "");
  const start = params[0];

  if (start?.startsWith("?")) {
    type = CODE_TYPES.DEC;
    if (start.length > 1) params[0] = start.slice(1);
    else params.shift();
    return { type, pos: introducer.pos, raw, command, params };
  }

  for (const param of params) {
    if (param && param.length > 0 && PRIVATE_OPENERS.has(param[0])) {
      type = CODE_TYPES.PRIVATE;
      const privateCommand = param[0] + command;

      for (let i = 0; i < params.length; i++) {
        if (params[i] && params[i].length > 0 && PRIVATE_OPENERS.has(params[i][0])) {
          if (params[i].length > 1) {
            params[i] = params[i].slice(1);
          } else {
            params.splice(i, 1);
          }
          break;
        }
      }

      return { type, pos: introducer.pos, raw, command: privateCommand, params };
    }
  }

  if (command === "m" && params.length === 5 && params[1] === "2" && (start === "38" || start === "48")) {
    params.splice(2, 0, "0");
  }

  if (command === "r" && params.length === 2 && params[1] === "0") {
    params[1] = "-1";
  }

  return { type, pos: introducer.pos, raw, command, params };
}
