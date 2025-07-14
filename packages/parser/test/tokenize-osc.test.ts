import { test } from "node:test";
import assert from "node:assert/strict";
import { tokenize } from "../src/tokenize.ts";
import { tokenize as tokenizeEscaped } from "../src/tokenize.escaped.ts";

test("OSC with BEL", () => {
  assert.deepEqual(tokenize("\x1b]0;title\x07"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b]", code: "\x9d" },
    { type: "DATA", pos: 2, raw: "0;title" },
    { type: "FINAL", pos: 9, raw: "\u0007" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b]0;title\x07`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 5, raw: "0;title" },
    { type: "FINAL", pos: 12, raw: "\\x07" },
  ]);
});

test("OSC with ST", () => {
  assert.deepEqual(tokenize("\x1b]0;title\x9c"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b]", code: "\x9d" },
    { type: "DATA", pos: 2, raw: "0;title" },
    { type: "FINAL", pos: 9, raw: "\x9c" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b]0;title\x9c`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 5, raw: "0;title" },
    { type: "FINAL", pos: 12, raw: "\\x9c" },
  ]);
});

test("OSC with complex data", () => {
  assert.deepEqual(tokenize("\x1b]8;;https://example.com\x07"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b]", code: "\x9d" },
    { type: "DATA", pos: 2, raw: "8;;https://example.com" },
    { type: "FINAL", pos: 24, raw: "\u0007" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b]8;;https://example.com\x07`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 5, raw: "8;;https://example.com" },
    { type: "FINAL", pos: 27, raw: "\\x07" },
  ]);
});

test("OSC with escape-backslash terminator", () => {
  assert.deepEqual(tokenize("\x1b]0;window title\x1b\\"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b]", code: "\x9d" },
    { type: "DATA", pos: 2, raw: "0;window title" },
    { type: "FINAL", pos: 16, raw: "\u001b\\" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b]0;window title\e\\`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 5, raw: "0;window title" },
    { type: "FINAL", pos: 19, raw: "\\e\\\\" },
  ]);
});
