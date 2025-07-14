import { test } from "node:test";
import assert from "node:assert/strict";
import { tokenize } from "../src/tokenize.ts";
import { tokenize as tokenizeEscaped } from "../src/tokenize.escaped.ts";

test("ESC with charset", () => {
  assert.deepEqual(tokenize("\x1b(B"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b(", code: "\u001b", intermediate: "(" },
    { type: "FINAL", pos: 2, raw: "B" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b(B`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b(", code: "\u001b", intermediate: "(" },
    { type: "FINAL", pos: 5, raw: "B" },
  ]);
});

test("simple ESC sequence", () => {
  assert.deepEqual(tokenize("\x1bc"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b", code: "\u001b" },
    { type: "FINAL", pos: 1, raw: "c" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1bc`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b", code: "\u001b" },
    { type: "FINAL", pos: 4, raw: "c" },
  ]);
});

test("unicode ESC variants", () => {
  assert.deepEqual(tokenize("\u001b[2q"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "2" },
    { type: "FINAL", pos: 3, raw: "q" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\u001b[2q`), [
    { type: "INTRODUCER", pos: 0, raw: "\\u001b[", code: "\x9b" },
    { type: "DATA", pos: 7, raw: "2" },
    { type: "FINAL", pos: 8, raw: "q" },
  ]);
});

test("mixed text and sequences", () => {
  assert.deepEqual(tokenize("Hello\x1b[31mworld\x1b[0m!"), [
    { type: "TEXT", pos: 0, raw: "Hello" },
    { type: "INTRODUCER", pos: 5, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 7, raw: "31" },
    { type: "FINAL", pos: 9, raw: "m" },
    { type: "TEXT", pos: 10, raw: "world" },
    { type: "INTRODUCER", pos: 15, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 17, raw: "0" },
    { type: "FINAL", pos: 18, raw: "m" },
    { type: "TEXT", pos: 19, raw: "!" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`Hello\x1b[31mworld\x1b[0m!`), [
    { type: "TEXT", pos: 0, raw: "Hello" },
    { type: "INTRODUCER", pos: 5, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 10, raw: "31" },
    { type: "FINAL", pos: 12, raw: "m" },
    { type: "TEXT", pos: 13, raw: "world" },
    { type: "INTRODUCER", pos: 18, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 23, raw: "0" },
    { type: "FINAL", pos: 24, raw: "m" },
    { type: "TEXT", pos: 25, raw: "!" },
  ]);
});

test("multiple consecutive sequences", () => {
  assert.deepEqual(tokenize("\x1b[31m\x1b[1m\x1b[4m"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "31" },
    { type: "FINAL", pos: 4, raw: "m" },
    { type: "INTRODUCER", pos: 5, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 7, raw: "1" },
    { type: "FINAL", pos: 8, raw: "m" },
    { type: "INTRODUCER", pos: 9, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 11, raw: "4" },
    { type: "FINAL", pos: 12, raw: "m" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b[31m\x1b[1m\x1b[4m`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "31" },
    { type: "FINAL", pos: 7, raw: "m" },
    { type: "INTRODUCER", pos: 8, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 13, raw: "1" },
    { type: "FINAL", pos: 14, raw: "m" },
    { type: "INTRODUCER", pos: 15, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 20, raw: "4" },
    { type: "FINAL", pos: 21, raw: "m" },
  ]);
});

test("ESC sequence variations", () => {
  assert.deepEqual(tokenize("\x1b#8"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b#", code: "\u001b", intermediate: "#" },
    { type: "FINAL", pos: 2, raw: "8" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b#8`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b#", code: "\u001b", intermediate: "#" },
    { type: "FINAL", pos: 5, raw: "8" },
  ]);
});

test("empty sequences", () => {
  assert.deepEqual(tokenize("\x1b[m"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "FINAL", pos: 2, raw: "m" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b[m`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "FINAL", pos: 5, raw: "m" },
  ]);
});

test("sequences with trailing semicolons", () => {
  assert.deepEqual(tokenize("\x1b[31;m"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "31;" },
    { type: "FINAL", pos: 5, raw: "m" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b[31;m`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "31;" },
    { type: "FINAL", pos: 8, raw: "m" },
  ]);
});
