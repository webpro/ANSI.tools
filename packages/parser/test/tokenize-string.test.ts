import { test } from "node:test";
import assert from "node:assert/strict";
import { tokenize } from "../src/tokenize.ts";
import { tokenize as tokenizeEscaped } from "../src/tokenize.escaped.ts";

test("DCS sequence", () => {
  assert.deepEqual(tokenize("\x1bP1$tcolor\x1b\\"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001bP", code: "P" },
    { type: "DATA", pos: 2, raw: "1$tcolor" },
    { type: "FINAL", pos: 10, raw: "\u001b\\" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1bP1$tcolor\x1b\\`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1bP", code: "P" },
    { type: "DATA", pos: 5, raw: "1$tcolor" },
    { type: "FINAL", pos: 13, raw: "\\x1b\\\\" },
  ]);
});

test("APC sequence", () => {
  assert.deepEqual(tokenize("\x1b_data\x9c"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b_", code: "_" },
    { type: "DATA", pos: 2, raw: "data" },
    { type: "FINAL", pos: 6, raw: "\x9c" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b_data\x9c`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b_", code: "_" },
    { type: "DATA", pos: 5, raw: "data" },
    { type: "FINAL", pos: 9, raw: "\\x9c" },
  ]);
});

test("PM sequence", () => {
  assert.deepEqual(tokenize("\x1b^private\x9c"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b^", code: "^" },
    { type: "DATA", pos: 2, raw: "private" },
    { type: "FINAL", pos: 9, raw: "\x9c" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b^private\x9c`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b^", code: "^" },
    { type: "DATA", pos: 5, raw: "private" },
    { type: "FINAL", pos: 12, raw: "\\x9c" },
  ]);
});

test("SOS sequence", () => {
  assert.deepEqual(tokenize("\x1bXstart\x1b\\"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001bX", code: "X" },
    { type: "DATA", pos: 2, raw: "start" },
    { type: "FINAL", pos: 7, raw: "\u001b\\" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1bXstart\x1b\\`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1bX", code: "X" },
    { type: "DATA", pos: 5, raw: "start" },
    { type: "FINAL", pos: 10, raw: "\\x1b\\\\" },
  ]);
});

test("8-bit control characters", () => {
  assert.deepEqual(tokenize("\x9d0;title\x07"), [
    { type: "INTRODUCER", pos: 0, raw: "\x9d", code: "\x9d" },
    { type: "DATA", pos: 1, raw: "0;title" },
    { type: "FINAL", pos: 8, raw: "\u0007" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x9d0;title\x07`), [
    { type: "TEXT", pos: 1, raw: "x9d0;title" },
    { type: "TEXT", pos: 12, raw: "x07" },
  ]);
});

test("raw 8-bit sequences", () => {
  assert.deepEqual(tokenize("\x900;1|data\x9c"), [
    { type: "INTRODUCER", pos: 0, raw: "\x90", code: "\x90" },
    { type: "DATA", pos: 1, raw: "0;1|data" },
    { type: "FINAL", pos: 9, raw: "\x9c" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x900;1|data\x9c`), [
    { type: "TEXT", pos: 1, raw: "x900;1|data" },
    { type: "TEXT", pos: 13, raw: "x9c" },
  ]);
});

test("raw APC sequence", () => {
  assert.deepEqual(tokenize("\x9fapp data\x9c"), [
    { type: "INTRODUCER", pos: 0, raw: "\x9f", code: "\x9f" },
    { type: "DATA", pos: 1, raw: "app data" },
    { type: "FINAL", pos: 9, raw: "\x9c" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x9fapp data\x9c`), [
    { type: "TEXT", pos: 1, raw: "x9fapp data" },
    { type: "TEXT", pos: 13, raw: "x9c" },
  ]);
});

test("raw PM sequence", () => {
  assert.deepEqual(tokenize("\x9eprivacy data\x9c"), [
    { type: "INTRODUCER", pos: 0, raw: "\x9e", code: "\x9e" },
    { type: "DATA", pos: 1, raw: "privacy data" },
    { type: "FINAL", pos: 13, raw: "\x9c" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x9eprivacy data\x9c`), [
    { type: "TEXT", pos: 1, raw: "x9eprivacy data" },
    { type: "TEXT", pos: 17, raw: "x9c" },
  ]);
});

test("raw SOS sequence", () => {
  assert.deepEqual(tokenize("\x98string data\x9c"), [
    { type: "INTRODUCER", pos: 0, raw: "\x98", code: "\x98" },
    { type: "DATA", pos: 1, raw: "string data" },
    { type: "FINAL", pos: 12, raw: "\x9c" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x98string data\x9c`), [
    { type: "TEXT", pos: 1, raw: "x98string data" },
    { type: "TEXT", pos: 16, raw: "x9c" },
  ]);
});

test("DEC private mode hide cursor", () => {
  assert.deepEqual(tokenize("\x1b[?25l"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "?25" },
    { type: "FINAL", pos: 5, raw: "l" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b[?25l`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "?25" },
    { type: "FINAL", pos: 8, raw: "l" },
  ]);
});

test("DEC private modes", () => {
  assert.deepEqual(tokenize("\x1b[?25h"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "?25" },
    { type: "FINAL", pos: 5, raw: "h" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b[?25h`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "?25" },
    { type: "FINAL", pos: 8, raw: "h" },
  ]);
});

test("ESC with backslash terminator", () => {
  assert.deepEqual(tokenize("\x1b_payload\x1b\\"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b_", code: "_" },
    { type: "DATA", pos: 2, raw: "payload" },
    { type: "FINAL", pos: 9, raw: "\u001b\\" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b_payload\x1b\\`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b_", code: "_" },
    { type: "DATA", pos: 5, raw: "payload" },
    { type: "FINAL", pos: 12, raw: "\\x1b\\\\" },
  ]);
});

test("DCS with escape-backslash terminator", () => {
  assert.deepEqual(tokenize("\x1bP0;1|name\x1b\\"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001bP", code: "P" },
    { type: "DATA", pos: 2, raw: "0;1|name" },
    { type: "FINAL", pos: 10, raw: "\u001b\\" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1bP0;1|name\e\\`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1bP", code: "P" },
    { type: "DATA", pos: 5, raw: "0;1|name" },
    { type: "FINAL", pos: 13, raw: "\\e\\\\" },
  ]);
});

test("APC with escape-backslash terminator", () => {
  assert.deepEqual(tokenize("\x1b_some payload\x1b\\"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b_", code: "_" },
    { type: "DATA", pos: 2, raw: "some payload" },
    { type: "FINAL", pos: 14, raw: "\u001b\\" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b_some payload\e\\`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b_", code: "_" },
    { type: "DATA", pos: 5, raw: "some payload" },
    { type: "FINAL", pos: 17, raw: "\\e\\\\" },
  ]);
});

test("PM with escape-backslash terminator", () => {
  assert.deepEqual(tokenize("\x1b^privacy data\x1b\\"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b^", code: "^" },
    { type: "DATA", pos: 2, raw: "privacy data" },
    { type: "FINAL", pos: 14, raw: "\u001b\\" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b^privacy data\e\\`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b^", code: "^" },
    { type: "DATA", pos: 5, raw: "privacy data" },
    { type: "FINAL", pos: 17, raw: "\\e\\\\" },
  ]);
});

test("SOS with escape-backslash terminator", () => {
  assert.deepEqual(tokenize("\x1bXstring data\x1b\\"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001bX", code: "X" },
    { type: "DATA", pos: 2, raw: "string data" },
    { type: "FINAL", pos: 13, raw: "\u001b\\" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1bXstring data\e\\`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1bX", code: "X" },
    { type: "DATA", pos: 5, raw: "string data" },
    { type: "FINAL", pos: 16, raw: "\\e\\\\" },
  ]);
});
