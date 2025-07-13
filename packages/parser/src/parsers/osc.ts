import { CODE_TYPES } from "../constants.ts";
import type { CONTROL_CODE } from "../types.ts";

export function parseOSC(pos: number, raw: string, data: string): CONTROL_CODE {
  const semicolonIndex = data.indexOf(";");
  if (semicolonIndex === -1) {
    return { type: CODE_TYPES.OSC, pos, raw, command: data, params: [] };
  }
  const command = data.slice(0, semicolonIndex);
  const remainder = data.slice(semicolonIndex + 1);

  if (command === "1337") return { type: CODE_TYPES.OSC, pos, raw, command, params: [remainder] };

  const params = [];
  if (remainder) {
    let current = "";
    for (let i = 0; i < remainder.length; i++) {
      if (remainder[i] === ";") {
        params.push(current);
        current = "";
      } else {
        current += remainder[i];
      }
    }
    params.push(current);
  }

  return { type: CODE_TYPES.OSC, pos, raw, command, params };
}
