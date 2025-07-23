import { CODE_TYPES } from "../constants.ts";
import type { CODE, TOKEN } from "../types.ts";

export function parseESC(introducer: TOKEN, dataTokens: TOKEN[], final?: TOKEN): CODE {
  const data = dataTokens.map(t => t.raw).join("");
  const command = introducer.intermediate || (dataTokens[0]?.raw ?? final?.raw ?? "");
  const params = introducer.intermediate ? (final?.raw ? [final.raw] : []) : [];
  const raw = introducer.raw + data + (final?.raw ?? "");
  return { type: CODE_TYPES.ESC, pos: introducer.pos, raw, command, params };
}
