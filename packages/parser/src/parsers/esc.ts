import { CODE_TYPES } from "../constants.ts";
import type { CONTROL_CODE, TOKEN } from "../types.ts";

export function parseESC(token: TOKEN, raw: string, command: string, data?: string): CONTROL_CODE {
  if (token.intermediate) {
    return { type: CODE_TYPES.ESC, pos: token.pos, raw, command: token.intermediate, params: command ? [command] : [] };
  }

  return {
    type: CODE_TYPES.ESC,
    pos: token.pos,
    raw,
    command,
    params: data ? [data] : [],
  };
}
