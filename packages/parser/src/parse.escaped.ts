import { parseTokens } from "./parse.ts";
import { tokenize } from "./tokenize.escaped.ts";
import type { CODE } from "./types.ts";

export function parse(input: string): CODE[] {
  return parseTokens(tokenize(input));
}
