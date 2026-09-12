import type { TOKEN } from "../types.ts";

export function join(tokens: TOKEN[]): string {
  if (tokens.length === 1) return tokens[0].raw;
  if (tokens.length === 0) return "";
  let data = "";
  for (const token of tokens) data += token.raw;
  return data;
}

export function joinData(tokens: TOKEN[]): string {
  if (tokens.length === 1) return tokens[0].code ?? tokens[0].raw;
  let data = "";
  for (const token of tokens) data += token.code ?? token.raw;
  return data;
}
