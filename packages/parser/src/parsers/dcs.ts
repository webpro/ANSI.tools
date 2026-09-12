import { CODE_TYPES, PARAM_SEPARATOR } from "../constants.ts";
import type { CODE, TOKEN } from "../types.ts";
import { join } from "./data.ts";

const DCS_PATTERNS = new Map([
  ["$q", true],
  ["+q", true],
  ["+p", true],
  ["|", true],
  ["{", true],
  ["$p", false],
  ["$t", false],
  ["$u", false],
]);

export function parseDCS(introducer: TOKEN, dataTokens: TOKEN[], final: TOKEN | undefined): CODE {
  const data = join(dataTokens);
  const raw = introducer.raw + data + (final?.raw ?? "");
  if (!data) return { type: CODE_TYPES.DCS, pos: introducer.pos, raw, command: "", params: [] };

  let paramEnd = 0;
  while (paramEnd < data.length) {
    const byte = data.charCodeAt(paramEnd);
    if ((byte < 0x30 || byte > 0x39) && byte !== 0x3b) break;
    paramEnd++;
  }

  let finalIndex = paramEnd;
  while (finalIndex < data.length) {
    const byte = data.charCodeAt(finalIndex);
    if (byte < 0x20 || byte > 0x2f) break;
    finalIndex++;
  }

  const finalByte = data.charCodeAt(finalIndex);
  const command = finalByte >= 0x40 && finalByte <= 0x7e ? data.slice(paramEnd, finalIndex + 1) : "";
  const splitPayload = DCS_PATTERNS.get(command);
  if (splitPayload === undefined) {
    return { type: CODE_TYPES.DCS, pos: introducer.pos, raw, command: "", params: [data] };
  }

  // Keep the original params representation when naming a previously generic sequence.
  if (paramEnd > 0 || !splitPayload) {
    return { type: CODE_TYPES.DCS, pos: introducer.pos, raw, command, params: [data] };
  }

  const remainder = data.slice(finalIndex + 1);
  const params = [];
  if (remainder) {
    for (const part of remainder.split(PARAM_SEPARATOR)) params.push(part || "-1");
  }
  return { type: CODE_TYPES.DCS, pos: introducer.pos, raw, command, params };
}
