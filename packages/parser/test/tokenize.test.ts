import { test } from "node:test";
import { tokenize } from "../src/tokenize.ts";
import { tokenize as tokenizeEscaped } from "../src/tokenize.escaped.ts";
import type { TOKEN } from "../src/types.ts";

test("empty input", t => {
  const input = String.raw``;
  const expected: TOKEN[] = [];
  t.assert.equalTokensDual(input, expected);
});

test("plain text", t => {
  const input = String.raw`Hello, world!`;
  const expected = [{ pos: 0, raw: "Hello, world!", type: "TEXT" }];
  t.assert.equalTokensDual(input, expected);
});

test("code", t => {
  const input = String.raw`\x1b[31m`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "31" },
    { type: "FINAL", pos: 7, raw: "m" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("tab", t => {
  const input = String.raw`Hello\nWorld\t!`;
  const expected = [{ pos: 0, raw: "Hello\\nWorld\\t!", type: "TEXT" }];
  t.assert.equalTokensDual(input, expected);
});

test("incomplete", t => {
  const input1 = String.raw`\x1b`;
  const expected1: TOKEN[] = [];
  t.assert.equalTokensDual(input1, expected1);
  t.assert.equalTokensDual(input1, expected1);

  const input2 = String.raw`\x1b[`;
  const expected2 = [{ pos: 0, raw: `\\x1b[`, type: "INTRODUCER", code: "\x9b" }];
  t.assert.equalTokensDual(input2, expected2);
  t.assert.equalTokensDual(input2, expected2);

  const input3 = String.raw`\x1b[31;42`;
  const expected3 = [{ pos: 0, raw: `\\x1b[`, type: "INTRODUCER", code: "\x9b" }];
  t.assert.equalTokensDual(input3, expected3);
  t.assert.equalTokensDual(input3, expected3);
});

test("mixed sequences", t => {
  const input = String.raw`\x1b]0;title`;
  const expected = [{ pos: 0, raw: "\\x1b]", type: "INTRODUCER", code: "\x9d" }];
  t.assert.equalTokensDual(input, expected);
  t.assert.equalTokensDual(input, expected);
});

test("boundary conditions", t => {
  const input = String.raw`text\x1b`;
  const expected = [{ pos: 0, raw: "text", type: "TEXT" }];
  t.assert.equalTokensDual(input, expected);
  t.assert.equalTokensDual(input, expected);
});

test("incomplete sequence", t => {
  const input = String.raw`text\x1b[`;
  const expected = [
    { pos: 0, raw: "text", type: "TEXT" },
    { pos: 4, raw: "\\x1b[", type: "INTRODUCER", code: "\x9b" },
  ];
  t.assert.equalTokensDual(input, expected);
  t.assert.equalTokensDual(input, expected);
});

test("just introducer", t => {
  const input = String.raw`\x1b`;
  const expected: TOKEN[] = [];
  t.assert.equalTokensDual(input, expected);
});

test("nested/overlapping", t => {
  const input = String.raw`\x1b]0;title\x1bm\x07`;
  const expected = [
    { pos: 0, raw: "\\x1b]", type: "INTRODUCER", code: "\x9d" },
    { pos: 2, raw: "0;title", type: "DATA" },
    { pos: 9, raw: "\\x1b", type: "INTRODUCER", code: "\x1b" },
    { pos: 10, raw: "m", type: "FINAL" },
    { pos: 11, raw: "\\x07", type: "TEXT" },
  ];
  t.assert.equalTokens(tokenize, input, expected);
});

test("multiple sequences", t => {
  const input = String.raw`\x1b[\x1b[\x1b[`;
  const expected = [
    { pos: 0, raw: "\\x1b[", type: "INTRODUCER", code: "\x9b" },
    { pos: 5, raw: "\\x1b[", type: "INTRODUCER", code: "\x9b" },
    { pos: 10, raw: "\\x1b[", type: "INTRODUCER", code: "\x9b" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("invalid UTF-8", t => {
  const invalid = "\xff\xfe\xfd";
  const expected = [{ pos: 0, raw: invalid, type: "TEXT" }];
  t.assert.equalTokensDual(invalid, expected);
});

test("invalid escape sequences", t => {
  const input = String.raw`\x1b\xff`;
  const expected = [
    { pos: 0, raw: "\\x1b", type: "INTRODUCER", code: "\x1b" },
    { pos: 1, raw: "\\xff", type: "FINAL" },
  ];
  t.assert.equalTokens(tokenize, input, expected);
});

test("null bytes", t => {
  const input = String.raw`hello\x00world`;
  const expected = [{ pos: 0, raw: "hello\\x00world", type: "TEXT" }];
  t.assert.equalTokens(tokenize, input, expected);
});

test("control characters", t => {
  const input = String.raw`\x1b[\x00\x01\x02m`;
  const expected = [
    { pos: 0, raw: "\\x1b[", type: "INTRODUCER", code: "\x9b" },
    { pos: 2, raw: "\\x00\\x01\\x02", type: "DATA" },
    { pos: 5, raw: "m", type: "FINAL" },
  ];
  t.assert.equalTokens(tokenize, input, expected);
});

test("terminator edge cases", t => {
  const input = String.raw`\x1bP data\x1b`;
  const expectedRaw = [
    { pos: 0, raw: "\\x1bP", type: "INTRODUCER", code: "P" },
    { pos: 2, raw: " data", type: "DATA" },
  ];
  const expectedEscaped = [
    { pos: 0, raw: "\\x1bP", type: "INTRODUCER", code: "P" },
    { pos: 5, raw: " data", type: "DATA" },
  ];
  t.assert.equalTokens(tokenize, input, expectedRaw);
  t.assert.equalTokens(tokenizeEscaped, input, expectedEscaped);
});

test("8-bit control characters", t => {
  const input = String.raw`\x1b]0;title\x07\x1c`;
  const expected = [
    { pos: 0, raw: "\\x1b]", type: "INTRODUCER", code: "\x9d" },
    { pos: 2, raw: "0;title", type: "DATA" },
    { pos: 9, raw: "\\x07", type: "FINAL" },
    { pos: 10, raw: "\\x1c", type: "TEXT" },
  ];
  t.assert.equalTokens(tokenize, input, expected);
});

test("unicode", t => {
  const input = "Hello 🌍 World";
  const expected = [{ pos: 0, raw: "Hello 🌍 World", type: "TEXT" }];
  t.assert.equalTokensDual(input, expected);
});

test("high codepoints", t => {
  const input = String.raw`\x1b]0;Title \u{1F44D}\u{1F3FB} \u{1D49C}\x07`;
  const expected = [
    { pos: 0, raw: "\\x1b]", type: "INTRODUCER", code: "\x9d" },
    { pos: 5, raw: "0;Title \\u{1F44D}\\u{1F3FB} \\u{1D49C}", type: "DATA" },
    { pos: 41, raw: "\\x07", type: "FINAL" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("invalid 8-bit control characters", t => {
  for (const char of ["\x80", "\x9A"]) {
    const input = `before${char}after`;
    const expected = [{ type: "TEXT", pos: 0, raw: `before${char}after` }];
    t.assert.equalTokensDual(input, expected);
  }
});
