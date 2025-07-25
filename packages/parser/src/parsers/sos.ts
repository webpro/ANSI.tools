import { CODE_TYPES } from "../constants.ts";
import type { CODE, TOKEN } from "../types.ts";

export function parseSOS(introducer: TOKEN, dataTokens: TOKEN[], final: TOKEN | undefined): CODE {
  const data = dataTokens.map((t: TOKEN) => t.raw).join("");
  const raw = introducer.raw + data + (final?.raw || "");
  return { type: CODE_TYPES.STRING, pos: introducer.pos, raw, command: "SOS", params: data ? [data] : [] };
}
