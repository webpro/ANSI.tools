import { test } from "node:test";
import type { CODE } from "../src/types.ts";

test("CAN interrupting DEC sequence", t => {
  const input = String.raw`\u001b[31mRed \u001b[\u0018`;
  const expected: CODE[] = [
    { type: "CSI", pos: 0, raw: `\\u001b[31m`, command: "m", params: ["31"] },
    { type: "TEXT", pos: 10, raw: `Red ` },
    { type: "CSI", pos: 14, raw: `\\u001b[`, command: "", params: [] },
  ];
  t.assert.equalCodesDual(input, expected);
});

test("CAN interrupting DEC sequence", t => {
  const input = String.raw`\x1b[31mRed \x1b[?\x18\x1b[32mGreen after CAN\x1b[0m`;
  const expected: CODE[] = [
    { type: "CSI", pos: 0, raw: `\\x1b[31m`, command: "m", params: ["31"] },
    { type: "TEXT", pos: 8, raw: `Red ` },
    { type: "DEC", pos: 12, raw: `\\x1b[?`, command: "", params: [] },
    { type: "CSI", pos: 22, raw: `\\x1b[32m`, command: "m", params: ["32"] },
    { type: "TEXT", pos: 30, raw: `Green after CAN` },
    { type: "CSI", pos: 45, raw: `\\x1b[0m`, command: "m", params: ["0"] },
  ];
  t.assert.equalCodesDual(input, expected);
});

test("SUB interrupting truecolor sequence", t => {
  const input = String.raw`\x1b[38;2;255\x1a\x1b[33mYellow after SUB\x1b[0m`;
  const expected: CODE[] = [
    { type: "CSI", pos: 0, raw: `\\x1b[38;2;255`, command: "", params: ["38", "2", "255"] },
    { type: "CSI", pos: 17, raw: `\\x1b[33m`, command: "m", params: ["33"] },
    { type: "TEXT", pos: 25, raw: `Yellow after SUB` },
    { type: "CSI", pos: 41, raw: `\\x1b[0m`, command: "m", params: ["0"] },
  ];
  t.assert.equalCodesDual(input, expected);
});

test("ESC interrupting DEC sequence produces proper ESC", t => {
  const input = String.raw`\x1b[?1\x1b\x1b[2JCleared\x1b[0m`;
  const expected: CODE[] = [
    { type: "DEC", pos: 0, raw: `\\x1b[?1`, command: "", params: ["1"] },
    { type: "ESC", pos: 7, raw: `\\x1b`, command: "", params: [] },
    { type: "CSI", pos: 11, raw: `\\x1b[2J`, command: "J", params: ["2"] },
    { type: "TEXT", pos: 18, raw: `Cleared` },
    { type: "CSI", pos: 25, raw: `\\x1b[0m`, command: "m", params: ["0"] },
  ];
  t.assert.equalCodesDual(input, expected);
});

test("multiple CAN interruptions", t => {
  const input = String.raw`\x1b[38;5\x18\x1b[31m\x1b[?1\x18\x1b[0m`;
  const expected: CODE[] = [
    { type: "CSI", pos: 0, raw: `\\x1b[38;5`, command: "", params: ["38", "5"] },
    { type: "CSI", pos: 13, raw: `\\x1b[31m`, command: "m", params: ["31"] },
    { type: "DEC", pos: 21, raw: `\\x1b[?1`, command: "", params: ["1"] },
    { type: "CSI", pos: 32, raw: `\\x1b[0m`, command: "m", params: ["0"] },
  ];
  t.assert.equalCodesDual(input, expected);
});

test("SUB interrupting OSC sequence", t => {
  const input = String.raw`\x1b]8;;https://example.com\x1a\x1b[33mLink\x1b[0m`;
  const expected: CODE[] = [
    { type: "OSC", pos: 0, raw: `\\x1b]8;;https://example.com`, command: "8", params: ["", "https://example.com"] },
    { type: "CSI", pos: 31, raw: `\\x1b[33m`, command: "m", params: ["33"] },
    { type: "TEXT", pos: 39, raw: `Link` },
    { type: "CSI", pos: 43, raw: `\\x1b[0m`, command: "m", params: ["0"] },
  ];
  t.assert.equalCodesDual(input, expected);
});

test("ESC sequence followed by normal CSI", t => {
  const input = String.raw`\x1b(A\x1b[31mRed text\x1b[0m`;
  const expected: CODE[] = [
    { type: "ESC", pos: 0, raw: `\\x1b(A`, command: "(", params: ["A"] },
    { type: "CSI", pos: 6, raw: `\\x1b[31m`, command: "m", params: ["31"] },
    { type: "TEXT", pos: 14, raw: `Red text` },
    { type: "CSI", pos: 22, raw: `\\x1b[0m`, command: "m", params: ["0"] },
  ];
  t.assert.equalCodesDual(input, expected);
});

test("normal cursor sequences without interruption", t => {
  const input = String.raw`\x1b[?25l\x1b[1A\x1b[K\x1b[?25h`;
  const expected: CODE[] = [
    { type: "DEC", pos: 0, raw: `\\x1b[?25l`, command: "l", params: ["25"] },
    { type: "CSI", pos: 9, raw: `\\x1b[1A`, command: "A", params: ["1"] },
    { type: "CSI", pos: 16, raw: `\\x1b[K`, command: "K", params: [] },
    { type: "DEC", pos: 22, raw: `\\x1b[?25h`, command: "h", params: ["25"] },
  ];
  t.assert.equalCodesDual(input, expected);
});

test("complex interruption with surrounding text", t => {
  const input = String.raw`Before\x1b[31mRed \x1b[?\x18\x1b[32mGreen\x1b[0m After`;
  const expected: CODE[] = [
    { type: "TEXT", pos: 0, raw: `Before` },
    { type: "CSI", pos: 6, raw: `\\x1b[31m`, command: "m", params: ["31"] },
    { type: "TEXT", pos: 14, raw: `Red ` },
    { type: "DEC", pos: 18, raw: `\\x1b[?`, command: "", params: [] },
    { type: "CSI", pos: 28, raw: `\\x1b[32m`, command: "m", params: ["32"] },
    { type: "TEXT", pos: 36, raw: `Green` },
    { type: "CSI", pos: 41, raw: `\\x1b[0m`, command: "m", params: ["0"] },
    { type: "TEXT", pos: 48, raw: ` After` },
  ];
  t.assert.equalCodesDual(input, expected);
});
