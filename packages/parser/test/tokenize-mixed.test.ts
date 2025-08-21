import { test } from "node:test";

test("mixed string sequences with different terminators", t => {
  const input = String.raw`\x1b_app\e\\\x1bP0|data\x1b\\\x1b]0;title\x07`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b_", code: "_" },
    { type: "DATA", pos: 5, raw: "app" },
    { type: "FINAL", pos: 8, raw: "\\e\\\\" },
    { type: "INTRODUCER", pos: 12, raw: "\\x1bP", code: "P" },
    { type: "DATA", pos: 17, raw: "0|data" },
    { type: "FINAL", pos: 23, raw: "\\x1b\\\\" },
    { type: "INTRODUCER", pos: 29, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 34, raw: "0;title" },
    { type: "FINAL", pos: 41, raw: "\\x07" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("charset sequences", t => {
  const input = String.raw`\x1b(B`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b(", code: "\u001b", intermediate: "(" },
    { type: "FINAL", pos: 5, raw: "B" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("charset sequences without intermediate", t => {
  const input = String.raw`\x1bB`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b", code: "\u001b" },
    { type: "FINAL", pos: 4, raw: "B" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("UTF-8 character set", t => {
  const input = String.raw`\x1b%G`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b%", code: "\u001b", intermediate: "%" },
    { type: "FINAL", pos: 5, raw: "G" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("multiple consecutive mixed sequences", t => {
  const input = String.raw`\x1b[31m\x1b]0;title\x07`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "31" },
    { type: "FINAL", pos: 7, raw: "m" },
    { type: "INTRODUCER", pos: 8, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 13, raw: "0;title" },
    { type: "FINAL", pos: 20, raw: "\\x07" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("interleaved text and control", t => {
  const input = String.raw`A\x1b[31mB\x1b[0mC`;
  const expected = [
    { type: "TEXT", pos: 0, raw: "A" },
    { type: "INTRODUCER", pos: 1, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 6, raw: "31" },
    { type: "FINAL", pos: 8, raw: "m" },
    { type: "TEXT", pos: 9, raw: "B" },
    { type: "INTRODUCER", pos: 10, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 15, raw: "0" },
    { type: "FINAL", pos: 16, raw: "m" },
    { type: "TEXT", pos: 17, raw: "C" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("mixed standard and private sequences", t => {
  const input = String.raw`\e[31m\e[<5h\e[?25l\e[>c`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "\x9b" },
    { type: "DATA", pos: 3, raw: "31" },
    { type: "FINAL", pos: 5, raw: "m" },
    { type: "INTRODUCER", pos: 6, raw: "\\e[", code: "\x9b" },
    { type: "DATA", pos: 9, raw: "<5" },
    { type: "FINAL", pos: 11, raw: "h" },
    { type: "INTRODUCER", pos: 12, raw: "\\e[", code: "\x9b" },
    { type: "DATA", pos: 15, raw: "?25" },
    { type: "FINAL", pos: 18, raw: "l" },
    { type: "INTRODUCER", pos: 19, raw: "\\e[", code: "\x9b" },
    { type: "DATA", pos: 22, raw: ">" },
    { type: "FINAL", pos: 23, raw: "c" },
  ];
  t.assert.equalTokensDual(input, expected);
});
