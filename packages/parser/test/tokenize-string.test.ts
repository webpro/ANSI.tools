import { test } from "node:test";
import { tokenize } from "../src/tokenize.ts";
import { tokenize as tokenizeEscaped } from "../src/tokenize.escaped.ts";
import assert from "node:assert/strict";
import "./helpers.ts";

test("DCS sequence", t => {
  const input = String.raw`\x1bP1$tcolor\x1b\\`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1bP", code: "P" },
    { type: "DATA", pos: 5, raw: "1$tcolor" },
    { type: "FINAL", pos: 13, raw: "\\x1b\\\\" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("DCS with alternative terminator", t => {
  const input = String.raw`\x1bPdata\x9c`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1bP", code: "P" },
    { type: "DATA", pos: 5, raw: "data" },
    { type: "FINAL", pos: 9, raw: "\\x9c" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("APC sequence", t => {
  const input = String.raw`\x1b_data\x9c`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b_", code: "_" },
    { type: "DATA", pos: 5, raw: "data" },
    { type: "FINAL", pos: 9, raw: "\\x9c" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("PM sequence", t => {
  const input = String.raw`\x1b^private\x9c`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b^", code: "^" },
    { type: "DATA", pos: 5, raw: "private" },
    { type: "FINAL", pos: 12, raw: "\\x9c" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("SOS sequence", t => {
  const input = String.raw`\x1bXstart\x1b\\`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1bX", code: "X" },
    { type: "DATA", pos: 5, raw: "start" },
    { type: "FINAL", pos: 10, raw: "\\x1b\\\\" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("DEC private mode hide cursor", t => {
  const input = String.raw`\x1b[?25l`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "?25" },
    { type: "FINAL", pos: 8, raw: "l" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("DEC private modes", t => {
  const input = String.raw`\x1b[?25h`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "?25" },
    { type: "FINAL", pos: 8, raw: "h" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("ESC with backslash terminator", t => {
  const input = String.raw`\x1b_payload\x1b\\`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b_", code: "_" },
    { type: "DATA", pos: 5, raw: "payload" },
    { type: "FINAL", pos: 12, raw: "\\x1b\\\\" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("DCS with escape-backslash terminator", t => {
  const input = String.raw`\x1bP0;1|name\e\\`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1bP", code: "P" },
    { type: "DATA", pos: 5, raw: "0;1|name" },
    { type: "FINAL", pos: 13, raw: "\\e\\\\" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("APC with escape-backslash terminator", t => {
  const input = String.raw`\x1b_some payload\e\\`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b_", code: "_" },
    { type: "DATA", pos: 5, raw: "some payload" },
    { type: "FINAL", pos: 17, raw: "\\e\\\\" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("PM with escape-backslash terminator", t => {
  const input = String.raw`\x1b^privacy data\e\\`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b^", code: "^" },
    { type: "DATA", pos: 5, raw: "privacy data" },
    { type: "FINAL", pos: 17, raw: "\\e\\\\" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("SOS with escape-backslash terminator", t => {
  const input = String.raw`\x1bXstring data\e\\`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1bX", code: "X" },
    { type: "DATA", pos: 5, raw: "string data" },
    { type: "FINAL", pos: 16, raw: "\\e\\\\" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("8-bit control characters", () => {
  assert.deepEqual(tokenize("\x9d0;title\x07"), [
    { type: "INTRODUCER", pos: 0, raw: "\x9d", code: "\x9d" },
    { type: "DATA", pos: 1, raw: "0;title" },
    { type: "FINAL", pos: 8, raw: "\u0007" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x9d0;title\x07`), [{ type: "TEXT", pos: 0, raw: "\\x9d0;title\\x07" }]);
});

test("raw 8-bit sequences", () => {
  assert.deepEqual(tokenize("\x900;1|data\x9c"), [
    { type: "INTRODUCER", pos: 0, raw: "\x90", code: "\x90" },
    { type: "DATA", pos: 1, raw: "0;1|data" },
    { type: "FINAL", pos: 9, raw: "\x9c" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x900;1|data\x9c`), [
    { type: "TEXT", pos: 0, raw: "\\x900;1|data\\x9c" },
  ]);
});

test("raw APC sequence", () => {
  assert.deepEqual(tokenize("\x9fapp data\x9c"), [
    { type: "INTRODUCER", pos: 0, raw: "\x9f", code: "\x9f" },
    { type: "DATA", pos: 1, raw: "app data" },
    { type: "FINAL", pos: 9, raw: "\x9c" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x9fapp data\x9c`), [
    { type: "TEXT", pos: 0, raw: "\\x9fapp data\\x9c" },
  ]);
});

test("raw PM sequence", () => {
  assert.deepEqual(tokenize("\x9eprivacy data\x9c"), [
    { type: "INTRODUCER", pos: 0, raw: "\x9e", code: "\x9e" },
    { type: "DATA", pos: 1, raw: "privacy data" },
    { type: "FINAL", pos: 13, raw: "\x9c" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x9eprivacy data\x9c`), [
    { type: "TEXT", pos: 0, raw: "\\x9eprivacy data\\x9c" },
  ]);
});

test("raw SOS sequence", () => {
  assert.deepEqual(tokenize("\x98string data\x9c"), [
    { type: "INTRODUCER", pos: 0, raw: "\x98", code: "\x98" },
    { type: "DATA", pos: 1, raw: "string data" },
    { type: "FINAL", pos: 12, raw: "\x9c" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x98string data\x9c`), [
    { type: "TEXT", pos: 0, raw: "\\x98string data\\x9c" },
  ]);
});

test("incomplete string sequences", t => {
  t.assert.equalTokensDual(String.raw`\x1b]`, [{ type: "INTRODUCER", pos: 0, raw: "\\x1b]", code: "\x9d" }]);
  t.assert.equalTokensDual(String.raw`\x1bP`, [{ type: "INTRODUCER", pos: 0, raw: "\\x1bP", code: "P" }]);
  t.assert.equalTokensDual(String.raw`\x1b_`, [{ type: "INTRODUCER", pos: 0, raw: "\\x1b_", code: "_" }]);
  t.assert.equalTokensDual(String.raw`\x1b^`, [{ type: "INTRODUCER", pos: 0, raw: "\\x1b^", code: "^" }]);
  t.assert.equalTokensDual(String.raw`\x1bX`, [{ type: "INTRODUCER", pos: 0, raw: "\\x1bX", code: "X" }]);
});

test("DCS with lengthy data stream", t => {
  const longData = "A".repeat(100);
  const dcsInput = String.raw`\x1bP${longData}\x1b\\`;
  const dcsExpected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1bP", code: "P" },
    { type: "DATA", pos: 5, raw: longData },
    { type: "FINAL", pos: 105, raw: "\\x1b\\\\" },
  ];
  t.assert.equalTokensDual(dcsInput, dcsExpected);
});
