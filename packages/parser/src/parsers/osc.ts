import { CODE_TYPES } from "../constants.ts";
import type { CODE, TOKEN } from "../types.ts";
import { join } from "./data.ts";

export function parseOSC(introducer: TOKEN, dataTokens: TOKEN[], final: TOKEN | undefined): CODE {
  const data = join(dataTokens);
  const raw = introducer.raw + data + (final?.raw || "");
  const semicolonIndex = data.indexOf(";");
  if (semicolonIndex === -1) {
    return { type: CODE_TYPES.OSC, pos: introducer.pos, raw, command: data, params: [] };
  }
  const command = data.slice(0, semicolonIndex);
  const remainder = data.slice(semicolonIndex + 1);

  if (command === "1337") return { type: CODE_TYPES.OSC, pos: introducer.pos, raw, command, params: [remainder] };

  const params = remainder ? remainder.split(";") : [];

  return { type: CODE_TYPES.OSC, pos: introducer.pos, raw, command, params };
}
