import { CODE_TYPES } from "../constants.ts";
import type { CONTROL_CODE } from "../types.ts";

const DCS_PATTERNS = new Map([
  ["$q", 2],
  ["+q", 2],
  ["+p", 2],
  ["|", 1],
  ["{", 1],
]);

export function parseDCS(pos: number, raw: string, data: string): CONTROL_CODE {
  if (!data) return { type: CODE_TYPES.DCS, pos, raw, command: "", params: [] };

  for (const [pattern, length] of DCS_PATTERNS) {
    if (data.startsWith(pattern)) {
      const remainder = data.slice(length);
      const params = [];
      if (remainder) {
        let current = "";
        for (let i = 0; i < remainder.length; i++) {
          if (remainder[i] === ";") {
            params.push(current || "-1");
            current = "";
          } else {
            current += remainder[i];
          }
        }
        params.push(current || "-1");
      }
      return { type: CODE_TYPES.DCS, pos, raw, command: pattern, params };
    }
  }

  return { type: CODE_TYPES.DCS, pos, raw, command: "", params: [data] };
}
