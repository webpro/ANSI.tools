export type State = "GROUND" | "SEQUENCE";

export const CSI_ESCAPED = "\\u009b";
export const CSI_ESCAPED_HEX = "\\x9b";
export const ABANDONED = "ABANDONED";

const INTRODUCERS = [
  ["\\u001b", 6],
  [CSI_ESCAPED, 6],
  [CSI_ESCAPED_HEX, 4],
  ["\\x1b", 4],
  ["\\033", 4],
  ["\\e", 2],
] as const;

const INTERRUPTERS_ESCAPED = [
  ["\\x18", 4],
  ["\\x1a", 4],
  ["\\u0018", 6],
  ["\\u001a", 6],
] as const;

export const INTERRUPTER_LOOKUP = new Map<string, [string, number][]>();
for (const [sequence, len] of INTERRUPTERS_ESCAPED) {
  const secondChar = sequence[1];
  if (!INTERRUPTER_LOOKUP.has(secondChar)) INTERRUPTER_LOOKUP.set(secondChar, []);
  INTERRUPTER_LOOKUP.get(secondChar)?.push([sequence, len]);
}

export const INTRODUCER_LOOKUP = new Map<string, [string, number][]>();
for (const [sequence, len] of INTRODUCERS) {
  const secondChar = sequence[1];
  if (!INTRODUCER_LOOKUP.has(secondChar)) INTRODUCER_LOOKUP.set(secondChar, []);
  INTRODUCER_LOOKUP.get(secondChar)?.push([sequence, len]);
}
