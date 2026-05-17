import assert from "node:assert/strict";
import { test } from "node:test";
import { parse } from "../src/parse.ts";
import type { CODE } from "../src/types.ts";

function semantic(codes: CODE[]) {
  return codes.map(c =>
    c.type === "TEXT" ? { type: c.type } : { type: c.type, command: c.command, params: c.params }
  );
}

function rawJoin(codes: CODE[]): string {
  let s = "";
  for (const c of codes) s += c.raw;
  return s;
}

// [name, 7-bit, 8-bit]
const pairs: [string, string, string][] = [
  ["CSI SGR", "\x1b[1;31m", "\x9b1;31m"],
  ["CSI cursor position", "\x1b[10;20H", "\x9b10;20H"],
  ["CSI DEC private mode", "\x1b[?25l", "\x9b?25l"],
  ["CSI private (>)", "\x1b[>0;1c", "\x9b>0;1c"],
  ["OSC title (BEL)", "\x1b]0;hello\x07", "\x9d0;hello\x07"],
  ["OSC 8 hyperlink", "\x1b]8;;https://example.com\x07", "\x9d8;;https://example.com\x07"],
  ["OSC 52 clipboard", "\x1b]52;c;SGVsbG8=\x07", "\x9d52;c;SGVsbG8=\x07"],
  ["DCS DECRQSS", "\x1bP$qm\x1b\\", "\x90$qm\x9c"],
];

for (const [name, sevenBit, eightBit] of pairs) {
  test(`7-bit equivalent to 8-bit: ${name}`, () => {
    assert.deepEqual(semantic(parse(eightBit)), semantic(parse(sevenBit)), name);
    // both forms remain lossless
    assert.equal(rawJoin(parse(sevenBit)), sevenBit, `${name} 7-bit lossless`);
    assert.equal(rawJoin(parse(eightBit)), eightBit, `${name} 8-bit lossless`);
  });
}
