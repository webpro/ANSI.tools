import { CODE_TYPES } from "../constants.ts";
import type { CODE, TOKEN } from "../types.ts";

export function parseOSC(introducer: TOKEN, dataTokens: TOKEN[], final: TOKEN): CODE {
  const data = dataTokens.map(t => t.raw).join("");
  const raw = introducer.raw + data + final.raw;
  const semicolonIndex = data.indexOf(";");
  if (semicolonIndex === -1) {
    return { type: CODE_TYPES.OSC, pos: introducer.pos, raw, command: data, params: [] };
  }
  const command = data.slice(0, semicolonIndex);
  const remainder = data.slice(semicolonIndex + 1);

  if (command === "1337") return { type: CODE_TYPES.OSC, pos: introducer.pos, raw, command, params: [remainder] };

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

  return { type: CODE_TYPES.OSC, pos: introducer.pos, raw, command, params };
}
