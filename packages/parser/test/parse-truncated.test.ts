import { test } from "node:test";
import type { CODE } from "../src/types.ts";

test("truncated CSI keeps params", t => {
  const input = String.raw`\x1b[31`;
  const expected: CODE[] = [{ type: "CSI", pos: 0, raw: "\\x1b[31", command: "", params: ["31"] }];
  t.assert.equalCodesDual(input, expected);
});

test("truncated CSI multi-param keeps params", t => {
  const input = String.raw`\x1b[1;31;42`;
  const expected: CODE[] = [{ type: "CSI", pos: 0, raw: "\\x1b[1;31;42", command: "", params: ["1", "31", "42"] }];
  t.assert.equalCodesDual(input, expected);
});

test("bare CSI introducer (no data) unchanged", t => {
  const input = String.raw`\x1b[`;
  const expected: CODE[] = [{ type: "CSI", pos: 0, raw: "\\x1b[", command: "", params: [] }];
  t.assert.equalCodesDual(input, expected);
});

test("truncated OSC keeps command + params", t => {
  const input = String.raw`\x1b]0;title`;
  const expected: CODE[] = [{ type: "OSC", pos: 0, raw: "\\x1b]0;title", command: "0", params: ["title"] }];
  t.assert.equalCodesDual(input, expected);
});

test("truncated OSC 8 hyperlink keeps url", t => {
  const input = String.raw`\x1b]8;;https://example.com`;
  const expected: CODE[] = [
    { type: "OSC", pos: 0, raw: "\\x1b]8;;https://example.com", command: "8", params: ["", "https://example.com"] },
  ];
  t.assert.equalCodesDual(input, expected);
});

test("truncated DCS keeps data", t => {
  const input = String.raw`\x1bPq~data`;
  const expected: CODE[] = [{ type: "DCS", pos: 0, raw: "\\x1bPq~data", command: "", params: ["q~data"] }];
  t.assert.equalCodesDual(input, expected);
});

test("truncated APC keeps payload", t => {
  const input = String.raw`\x1b_payload`;
  const expected: CODE[] = [{ type: "STRING", pos: 0, raw: "\\x1b_payload", command: "APC", params: ["payload"] }];
  t.assert.equalCodesDual(input, expected);
});

test("lone trailing ESC after text → ESC code", t => {
  const input = String.raw`abc\x1b`;
  const expected: CODE[] = [
    { type: "TEXT", pos: 0, raw: "abc" },
    { type: "ESC", pos: 3, raw: "\\x1b", command: "", params: [] },
  ];
  t.assert.equalCodesDual(input, expected);
});

test("bare ESC at EOF → ESC code", t => {
  const input = String.raw`\x1b`;
  const expected: CODE[] = [{ type: "ESC", pos: 0, raw: "\\x1b", command: "", params: [] }];
  t.assert.equalCodesDual(input, expected);
});

test("ESC + intermediate, no final → ESC code", t => {
  const input = String.raw`\x1b#`;
  const expected: CODE[] = [{ type: "ESC", pos: 0, raw: "\\x1b#", command: "#", params: [] }];
  t.assert.equalCodesDual(input, expected);
});

test("truncated 8-bit CSI keeps params", t => {
  const input = "\\u009b1;31";
  const expected: CODE[] = [{ type: "CSI", pos: 0, raw: "\\u009b1;31", command: "", params: ["1", "31"] }];
  t.assert.equalCodesDual(input, expected);
});

test("text then truncated CSI", t => {
  const input = String.raw`hi \x1b[38;5;200`;
  const expected: CODE[] = [
    { type: "TEXT", pos: 0, raw: "hi " },
    { type: "CSI", pos: 3, raw: "\\x1b[38;5;200", command: "", params: ["38", "5", "200"] },
  ];
  t.assert.equalCodesDual(input, expected);
});
