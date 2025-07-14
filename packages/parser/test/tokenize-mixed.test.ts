import { test } from "node:test";
import assert from "node:assert/strict";
import { tokenize } from "../src/tokenize.ts";
import { tokenize as tokenizeEscaped } from "../src/tokenize.escaped.ts";

test("mixed string sequences with different terminators", () => {
  assert.deepEqual(tokenize("\x1b_app\x1b\\\x1bP0|data\x1b\\\x1b]0;title\x07"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b_", code: "_" },
    { type: "DATA", pos: 2, raw: "app" },
    { type: "FINAL", pos: 5, raw: "\u001b\\" },
    { type: "INTRODUCER", pos: 7, raw: "\u001bP", code: "P" },
    { type: "DATA", pos: 9, raw: "0|data" },
    { type: "FINAL", pos: 15, raw: "\u001b\\" },
    { type: "INTRODUCER", pos: 17, raw: "\u001b]", code: "\x9d" },
    { type: "DATA", pos: 19, raw: "0;title" },
    { type: "FINAL", pos: 26, raw: "\u0007" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b_app\e\\\x1bP0|data\x1b\\\x1b]0;title\x07`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b_", code: "_" },
    { type: "DATA", pos: 5, raw: "app" },
    { type: "FINAL", pos: 8, raw: "\\e\\\\" },
    { type: "INTRODUCER", pos: 12, raw: "\\x1bP", code: "P" },
    { type: "DATA", pos: 17, raw: "0|data" },
    { type: "FINAL", pos: 23, raw: "\\x1b\\\\" },
    { type: "INTRODUCER", pos: 29, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 34, raw: "0;title" },
    { type: "FINAL", pos: 41, raw: "\\x07" },
  ]);
});

test("charset sequences", () => {
  assert.deepEqual(tokenize("\x1b(B"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b(", code: "\u001b", intermediate: "(" },
    { type: "FINAL", pos: 2, raw: "B" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b(B`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b(", code: "\u001b", intermediate: "(" },
    { type: "FINAL", pos: 5, raw: "B" },
  ]);
});

test("charset sequences without intermediate", () => {
  assert.deepEqual(tokenize("\x1bB"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b", code: "\u001b" },
    { type: "FINAL", pos: 1, raw: "B" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1bB`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b", code: "\u001b" },
    { type: "FINAL", pos: 4, raw: "B" },
  ]);
});

test("UTF-8 character set", () => {
  assert.deepEqual(tokenize("\x1b%G"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b%", code: "\u001b", intermediate: "%" },
    { type: "FINAL", pos: 2, raw: "G" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b%G`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b%", code: "\u001b", intermediate: "%" },
    { type: "FINAL", pos: 5, raw: "G" },
  ]);
});

test("multiple consecutive mixed sequences", () => {
  assert.deepEqual(tokenize("\x1b[31m\x1b]0;title\x07"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "31" },
    { type: "FINAL", pos: 4, raw: "m" },
    { type: "INTRODUCER", pos: 5, raw: "\u001b]", code: "\x9d" },
    { type: "DATA", pos: 7, raw: "0;title" },
    { type: "FINAL", pos: 14, raw: "\u0007" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b[31m\x1b]0;title\x07`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "31" },
    { type: "FINAL", pos: 7, raw: "m" },
    { type: "INTRODUCER", pos: 8, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 13, raw: "0;title" },
    { type: "FINAL", pos: 20, raw: "\\x07" },
  ]);
});

test("interleaved text and control", () => {
  assert.deepEqual(tokenize("A\x1b[31mB\x1b[0mC"), [
    { type: "TEXT", pos: 0, raw: "A" },
    { type: "INTRODUCER", pos: 1, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 3, raw: "31" },
    { type: "FINAL", pos: 5, raw: "m" },
    { type: "TEXT", pos: 6, raw: "B" },
    { type: "INTRODUCER", pos: 7, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 9, raw: "0" },
    { type: "FINAL", pos: 10, raw: "m" },
    { type: "TEXT", pos: 11, raw: "C" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`A\x1b[31mB\x1b[0mC`), [
    { type: "TEXT", pos: 0, raw: "A" },
    { type: "INTRODUCER", pos: 1, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 6, raw: "31" },
    { type: "FINAL", pos: 8, raw: "m" },
    { type: "TEXT", pos: 9, raw: "B" },
    { type: "INTRODUCER", pos: 10, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 15, raw: "0" },
    { type: "FINAL", pos: 16, raw: "m" },
    { type: "TEXT", pos: 17, raw: "C" },
  ]);
});

test("mixed standard and private sequences", () => {
  assert.deepEqual(tokenizeEscaped(String.raw`\e[31m\e[<5h\e[?25l\e[>c`), [
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
  ]);
});
