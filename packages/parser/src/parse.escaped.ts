import { parser } from "./parse.ts";
import { tokenizer } from "./tokenize.escaped.ts";
import type { CODE } from "./types.ts";

export function parse(input: string): CODE[] {
  return Array.from(parser(tokenizer(input)));
}
