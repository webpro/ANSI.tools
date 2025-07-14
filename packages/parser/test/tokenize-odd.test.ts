import { test } from "node:test";
import assert from "node:assert/strict";
import { tokenize } from "../src/tokenize.ts";
import { tokenize as tokenizeEscaped } from "../src/tokenize.escaped.ts";

test("alternative introducers", () => {
  assert.deepEqual(tokenize("\e[31m"), [{ type: "TEXT", pos: 0, raw: "e[31m" }]);

  assert.deepEqual(tokenizeEscaped(String.raw`\e[31m`), [
    { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "\x9b" },
    { type: "DATA", pos: 3, raw: "31" },
    { type: "FINAL", pos: 5, raw: "m" },
  ]);
});

test("text and csi", () => {
  assert.deepEqual(tokenizeEscaped(String.raw`hello \e[31mworld\e[0m`), [
    { type: "TEXT", pos: 0, raw: "hello " },
    { type: "INTRODUCER", pos: 6, raw: "\\e[", code: "\x9b" },
    { type: "DATA", pos: 9, raw: "31" },
    { type: "FINAL", pos: 11, raw: "m" },
    { type: "TEXT", pos: 12, raw: "world" },
    { type: "INTRODUCER", pos: 17, raw: "\\e[", code: "\x9b" },
    { type: "DATA", pos: 20, raw: "0" },
    { type: "FINAL", pos: 21, raw: "m" },
  ]);
});

test("octal escape notation", () => {
  assert.deepEqual(tokenize("\x1b[31m"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "31" },
    { type: "FINAL", pos: 4, raw: "m" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\033[31m`), [
    { type: "INTRODUCER", pos: 0, raw: "\\033[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "31" },
    { type: "FINAL", pos: 7, raw: "m" },
  ]);
});

test("string sequences with different terminators", () => {
  assert.deepEqual(tokenize("\x1bPdata\x1b\\"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001bP", code: "P" },
    { type: "DATA", pos: 2, raw: "data" },
    { type: "FINAL", pos: 6, raw: "\u001b\\" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1bPdata\x1b\\`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1bP", code: "P" },
    { type: "DATA", pos: 5, raw: "data" },
    { type: "FINAL", pos: 9, raw: "\\x1b\\\\" },
  ]);
});

test("malformed sequences", () => {
  assert.deepEqual(tokenize("\x1b["), [{ type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" }]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b[`), [{ type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" }]);
});

test("boundary characters", () => {
  assert.deepEqual(tokenize("\x1b[@@"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "FINAL", pos: 2, raw: "@" },
    { type: "TEXT", pos: 3, raw: "@" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b[@@`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "FINAL", pos: 5, raw: "@" },
    { type: "TEXT", pos: 6, raw: "@" },
  ]);
});

test("sequences at string boundaries", () => {
  assert.deepEqual(tokenize("\x1b[31m"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "31" },
    { type: "FINAL", pos: 4, raw: "m" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b[31m`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "31" },
    { type: "FINAL", pos: 7, raw: "m" },
  ]);
});

test("multiple string terminators", () => {
  assert.deepEqual(tokenize("\x1bPdata\x9c"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001bP", code: "P" },
    { type: "DATA", pos: 2, raw: "data" },
    { type: "FINAL", pos: 6, raw: "\x9c" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1bPdata\x9c`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1bP", code: "P" },
    { type: "DATA", pos: 5, raw: "data" },
    { type: "FINAL", pos: 9, raw: "\\x9c" },
  ]);
});

test("complex missing parameter scenarios", () => {
  assert.deepEqual(tokenizeEscaped(String.raw`\e[;5;m\e[?;h\eP$q;;\e\\`), [
    { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "\x9b" },
    { type: "DATA", pos: 3, raw: ";5;" },
    { type: "FINAL", pos: 6, raw: "m" },
    { type: "INTRODUCER", pos: 7, raw: "\\e[", code: "\x9b" },
    { type: "DATA", pos: 10, raw: "?;" },
    { type: "FINAL", pos: 12, raw: "h" },
    { type: "INTRODUCER", pos: 13, raw: "\\eP", code: "P" },
    { type: "DATA", pos: 16, raw: "$q;;" },
    { type: "FINAL", pos: 20, raw: "\\e\\\\" },
  ]);
});

test("parse DECUDK sequence", () => {
  assert.deepEqual(tokenizeEscaped(String.raw`\eP0|23/68656c6c6f\e\\`), [
    { type: "INTRODUCER", pos: 0, raw: "\\eP", code: "P" },
    { type: "DATA", pos: 3, raw: "0|23/68656c6c6f" },
    { type: "FINAL", pos: 18, raw: "\\e\\\\" },
  ]);
});

test("parse iTerm2 image sequence", () => {
  assert.deepEqual(tokenizeEscaped(String.raw`\e]1337;File=inline=1;width=1;height=1:R0lG=\a`), [
    { code: "\x9D", pos: 0, raw: "\\e]", type: "INTRODUCER" },
    { pos: 3, raw: "1337;File=inline=1;width=1;height=1:R0lG=", type: "DATA" },
    { pos: 44, raw: "\\a", type: "FINAL" },
  ]);
});
