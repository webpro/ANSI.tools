export type State = "GROUND" | "SEQUENCE";

export const CSI_ESCAPED = "\\u009b";
export const CSI_ESCAPED_HEX = "\\x9b";
export const ABANDONED = "ABANDONED";

export function nulLength(input: string, pos: number): number {
  const code = input.charCodeAt(pos);
  if (code === 0) return 1;
  if (code !== 92) return 0;
  if (input.startsWith("\\x00", pos)) return 4;
  if (input.startsWith("\\u0000", pos)) return 6;
  return 0;
}

export const STRING_TERMINATORS = ["\\e\\\\", "\\x1b\\\\", "\\u001b\\\\", "\\033\\\\", "\\x9c", "\\u009c"];

export function startsTerminator(next: string): boolean {
  return next === "e" || next === "x" || next === "u" || next === "0" || next === "a";
}

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
