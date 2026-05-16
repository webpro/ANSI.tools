import { CODE_TYPES } from "../constants.ts";
import type { CODE, TOKEN } from "../types.ts";
import { join } from "./data.ts";

export function parsePM(introducer: TOKEN, dataTokens: TOKEN[], final: TOKEN | undefined): CODE {
  const data = join(dataTokens);
  const raw = introducer.raw + data + (final?.raw || "");
  return { type: CODE_TYPES.STRING, pos: introducer.pos, raw, command: "PM", params: data ? [data] : [] };
}
