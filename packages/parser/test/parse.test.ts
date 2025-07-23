import { test } from "node:test";
import type { CODE } from "../src/types.ts";
import "./helpers.ts";

test("empty", t => {
  const input = String.raw``;
  const expected: CODE[] = [];
  t.assert.equalCodesDual(input, expected);
});

test("plain text", t => {
  const input = String.raw`Hello, world!`;
  const expected = [{ type: "TEXT", pos: 0, raw: "Hello, world!" }];
  t.assert.equalCodesDual(input, expected);
});

test("colon delimited parameters", t => {
  const input = String.raw`\x1b[0:1:2:3m`;
  const expected = [{ type: "CSI", pos: 0, raw: "\\x1b[0:1:2:3m", command: "m", params: ["0", "1", "2", "3"] }];
  t.assert.equalCodesDual(input, expected);
});

test("long parameter", t => {
  const input = String.raw`\x1b[999999999999999999999999m`;
  const expected = [
    { type: "CSI", pos: 0, raw: "\\x1b[999999999999999999999999m", command: "m", params: ["999999999999999999999999"] },
  ];
  t.assert.equalCodesDual(input, expected);
});

test("semicolons", t => {
  const input = String.raw`\x1b[;;;;;;;;;;;;;;;;m`;
  const expected = [
    {
      type: "CSI",
      pos: 0,
      raw: "\\x1b[;;;;;;;;;;;;;;;;m",
      command: "m",
      params: ["-1", "-1", "-1", "-1", "-1", "-1", "-1", "-1", "-1", "-1", "-1", "-1", "-1", "-1", "-1", "-1", "-1"],
    },
  ];
  t.assert.equalCodesDual(input, expected);
});

test("excessive parameters", t => {
  const input = String.raw`\x1b[1;2;3;4;5;6;7;8;9;10;11;12;13;14;15;16;17;18;19m`;
  const expected: CODE[] = [
    {
      type: "CSI",
      pos: 0,
      raw: "\\x1b[1;2;3;4;5;6;7;8;9;10;11;12;13;14;15;16;17;18;19m",
      command: "m",
      params: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"],
    },
  ];
  t.assert.equalCodesDual(input, expected);
});

test("DCS interrupted by CSI", t => {
  const input = String.raw`\x1bP\x1b[31m`;
  const expected: CODE[] = [{ type: "CSI", pos: 5, raw: "\\x1b[31m", command: "m", params: ["31"] }];
  t.assert.equalCodesDual(input, expected);
});

test("hyperlink with embedded CSI", t => {
  const input = String.raw`\x1b]8;;\x1b[31murl\x07text\x1b]8;;\x07`;
  const expected: CODE[] = [
    { type: "CSI", pos: 8, raw: "\\x1b[31m", command: "m", params: ["31"] },
    { type: "TEXT", pos: 16, raw: "url\\x07text" },
    { type: "OSC", pos: 27, raw: "\\x1b]8;;\\x07", command: "8", params: ["", ""] },
  ];
  t.assert.equalCodesDual(input, expected);
});

test("DEC interrupted by hyperlink", t => {
  const input = String.raw`\x1b[?1;2;3\x1b]8;;url\x07\x1b[4;5;6h`;
  const expected: CODE[] = [
    { type: "OSC", pos: 11, raw: "\\x1b]8;;url\\x07", command: "8", params: ["", "url"] },
    { type: "CSI", pos: 26, raw: "\\x1b[4;5;6h", command: "h", params: ["4", "5", "6"] },
  ];
  t.assert.equalCodesDual(input, expected);
});

test("emojis with colors", t => {
  const input = String.raw`\x1b[31m🔥\x1b[32m💚\x1b[34m🌊\x1b[0m`;
  const expected: CODE[] = [
    { type: "CSI", pos: 0, raw: "\\x1b[31m", command: "m", params: ["31"] },
    { type: "TEXT", pos: 8, raw: "🔥" },
    { type: "CSI", pos: 10, raw: "\\x1b[32m", command: "m", params: ["32"] },
    { type: "TEXT", pos: 18, raw: "💚" },
    { type: "CSI", pos: 20, raw: "\\x1b[34m", command: "m", params: ["34"] },
    { type: "TEXT", pos: 28, raw: "🌊" },
    { type: "CSI", pos: 30, raw: "\\x1b[0m", command: "m", params: ["0"] },
  ];
  t.assert.equalCodesDual(input, expected);
});

test("unicode in OSC title", t => {
  const input = String.raw`\x1b]0;💻 Terminal 🚀\x07`;
  const expected: CODE[] = [
    { type: "OSC", pos: 0, raw: "\\x1b]0;💻 Terminal 🚀\\x07", command: "0", params: ["💻 Terminal 🚀"] },
  ];
  t.assert.equalCodesDual(input, expected);
});

test("24-bit color with combining chars", t => {
  const input = String.raw`\x1b[38;2;255;0;128m🌈\u0301\u0302\u0303\x1b[0m`;
  const expected: CODE[] = [
    { type: "CSI", pos: 0, raw: "\\x1b[38;2;255;0;128m", command: "m", params: ["38", "2", "0", "255", "0", "128"] },
    { type: "TEXT", pos: 20, raw: "🌈\\u0301\\u0302\\u0303" },
    { type: "CSI", pos: 40, raw: "\\x1b[0m", command: "m", params: ["0"] },
  ];
  t.assert.equalCodesDual(input, expected);
});

test("private sequences with parameters", t => {
  const input = String.raw`\x1b[>0;2m\x1b[>1p`;
  const expected: CODE[] = [
    { type: "PRIVATE", pos: 0, raw: "\\x1b[>0;2m", command: ">m", params: ["0", "2"] },
    { type: "PRIVATE", pos: 10, raw: "\\x1b[>1p", command: ">p", params: ["1"] },
  ];
  t.assert.equalCodesDual(input, expected);
});
