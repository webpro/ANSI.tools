import type { TOKEN } from "../types.ts";

export function join(tokens: TOKEN[]): string {
  if (tokens.length === 1) return tokens[0].raw;
  if (tokens.length === 0) return "";
  let data = "";
  for (const token of tokens) data += token.raw;
  return data;
}
