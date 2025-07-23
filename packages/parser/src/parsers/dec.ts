import { CODE_TYPES, PARAM_SEPARATOR } from "../constants.ts";
import type { CODE, TOKEN } from "../types.ts";

export function parseDEC(introducer: TOKEN, dataTokens: TOKEN[], final: TOKEN | undefined): CODE {
  const data = dataTokens.map(t => t.raw).join("");
  const raw = introducer.raw + data + (final?.raw || "");
  let i = 0;
  let paramsRaw = "";
  while (i < data.length && data.charCodeAt(i) >= 0x30 && data.charCodeAt(i) <= 0x3f) {
    paramsRaw += data[i];
    i++;
  }
  const command = data.slice(i) + (final?.raw || "");
  const params = [];
  if (paramsRaw) {
    for (const part of paramsRaw.split(PARAM_SEPARATOR)) params.push(part || "-1");
  }
  return { type: CODE_TYPES.DEC, pos: introducer.pos, raw, command, params };
}
