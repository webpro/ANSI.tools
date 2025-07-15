import { CODE_TYPES } from "../constants.ts";
import type { CODE, TOKEN } from "../types.ts";

export function parseDEC(introducer: TOKEN, dataTokens: TOKEN[], final: TOKEN): CODE {
  const data = dataTokens.map(t => t.raw).join("");
  const raw = introducer.raw + data + final.raw;
  let i = 0;
  let paramsRaw = "";
  while (i < data.length && data.charCodeAt(i) >= 0x30 && data.charCodeAt(i) <= 0x3f) {
    paramsRaw += data[i];
    i++;
  }
  const command = data.slice(i) + final.raw;
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
  return { type: CODE_TYPES.DEC, pos: introducer.pos, raw, command, params };
}
