import { CODE_TYPES } from "../constants.ts";
import type { CODE, TOKEN } from "../types.ts";
import { join } from "./data.ts";

export function parseESC(introducer: TOKEN, dataTokens: TOKEN[], final?: TOKEN): CODE {
  const data = join(dataTokens);
  const command = introducer.intermediate || (dataTokens[0]?.raw ?? final?.raw ?? "");
  const params = introducer.intermediate ? (final?.raw ? [final.raw] : []) : [];
  const raw = introducer.raw + data + (final?.raw ?? "");
  return { type: CODE_TYPES.ESC, pos: introducer.pos, raw, command, params };
}
