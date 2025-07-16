import { test } from "node:test";
import { tokenize } from "../src/tokenize.ts";
import { tokenize as tokenizeEscaped } from "../src/tokenize.escaped.ts";
import assert from "node:assert/strict";

test("empty input", () => {
  assert.deepEqual(tokenize(""), []);
  assert.deepEqual(tokenizeEscaped(String.raw``), []);
});

test("plain text", () => {
  assert.deepEqual(tokenize("Hello, world!"), [{ pos: 0, raw: "Hello, world!", type: "TEXT" }]);
  assert.deepEqual(tokenizeEscaped(String.raw`Hello, world!`), [{ pos: 0, raw: "Hello, world!", type: "TEXT" }]);
});

test("tab", () => {
  assert.deepEqual(tokenize("Hello\nWorld\t!"), [{ pos: 0, raw: "Hello\nWorld\t!", type: "TEXT" }]);
  assert.deepEqual(tokenizeEscaped(String.raw`Hello\nWorld\t!`), [{ pos: 0, raw: "Hello\\nWorld\\t!", type: "TEXT" }]);
});

test("incomplete", () => {
  assert.deepEqual(tokenize("\x1b"), []);
  assert.deepEqual(tokenize("\x1b["), [{ pos: 0, raw: "\x1b[", type: "INTRODUCER", code: "\x9b" }]);
  assert.deepEqual(tokenize("\x1b[31;42"), [{ pos: 0, raw: "\x1b[", type: "INTRODUCER", code: "\x9b" }]);
});

test("malformed", () => {
  assert.deepEqual(tokenize("\x1b\x7f"), [
    { pos: 0, raw: "\x1b", type: "INTRODUCER", code: "\x1b" },
    { pos: 1, raw: "\x7f", type: "FINAL" },
  ]);
  assert.deepEqual(tokenizeEscaped(String.raw`\x1b\x7f`), [
    { pos: 0, raw: "\\x1b", type: "INTRODUCER", code: "\x1b" },
    { pos: 4, raw: "\\", type: "FINAL" },
    { pos: 5, raw: "x7f", type: "TEXT" },
  ]);

  assert.deepEqual(tokenize("\x1b]0;title"), [{ pos: 0, raw: "\x1b]", type: "INTRODUCER", code: "\x9d" }]);
  assert.deepEqual(tokenizeEscaped(String.raw`\x1b]0;title`), [
    { pos: 0, raw: "\\x1b]", type: "INTRODUCER", code: "\x9d" },
  ]);
});

test("boundary conditions", () => {
  assert.deepEqual(tokenize("text\x1b"), [{ pos: 0, raw: "text", type: "TEXT" }]);
  assert.deepEqual(tokenizeEscaped(String.raw`text\x1b`), [{ pos: 0, raw: "text", type: "TEXT" }]);

  assert.deepEqual(tokenize("text\x1b["), [
    { pos: 0, raw: "text", type: "TEXT" },
    { pos: 4, raw: "\x1b[", type: "INTRODUCER", code: "\x9b" },
  ]);
  assert.deepEqual(tokenizeEscaped(String.raw`text\x1b[`), [
    { pos: 0, raw: "text", type: "TEXT" },
    { pos: 4, raw: "\\x1b[", type: "INTRODUCER", code: "\x9b" },
  ]);

  assert.deepEqual(tokenize("\x1b"), []);
  assert.deepEqual(tokenizeEscaped(String.raw`\x1b`), []);
});

test("nested/overlapping", () => {
  assert.deepEqual(tokenize("\x1b]0;title\x1bm\x07"), [
    { pos: 0, raw: "\x1b]", type: "INTRODUCER", code: "\x9d" },
    { pos: 2, raw: "0;title\x1bm", type: "DATA" },
    { pos: 11, raw: "\x07", type: "FINAL" },
  ]);

  assert.deepEqual(tokenize("\x1b[\x1b[\x1b["), [
    { pos: 0, raw: "\x1b[", type: "INTRODUCER", code: "\x9b" },
    { pos: 2, raw: "\x1b", type: "DATA" },
    { pos: 3, raw: "[", type: "FINAL" },
    { pos: 4, raw: "\x1b[", type: "INTRODUCER", code: "\x9b" },
  ]);
});

test("invalid UTF-8", () => {
  const invalid = "\xff\xfe\xfd";
  assert.deepEqual(tokenize(invalid), [{ pos: 0, raw: invalid, type: "TEXT" }]);

  assert.deepEqual(tokenize("\x1b\xff"), [
    { pos: 0, raw: "\x1b", type: "INTRODUCER", code: "\x1b" },
    { pos: 1, raw: "\xff", type: "FINAL" },
  ]);
});

test("null bytes and control characters", () => {
  assert.deepEqual(tokenize("hello\x00world"), [{ pos: 0, raw: "hello\x00world", type: "TEXT" }]);

  assert.deepEqual(tokenize("\x1b[\x00\x01\x02m"), [
    { pos: 0, raw: "\x1b[", type: "INTRODUCER", code: "\x9b" },
    { pos: 2, raw: "\x00\x01\x02", type: "DATA" },
    { pos: 5, raw: "m", type: "FINAL" },
  ]);
});

test("terminator edge cases", () => {
  assert.deepEqual(tokenize("\x1bP data\x1b"), [{ pos: 0, raw: "\x1bP", type: "INTRODUCER", code: "P" }]);

  assert.deepEqual(tokenize("\x1b]0;title\x07\x1c"), [
    { pos: 0, raw: "\x1b]", type: "INTRODUCER", code: "\x9d" },
    { pos: 2, raw: "0;title", type: "DATA" },
    { pos: 9, raw: "\x07", type: "FINAL" },
    { pos: 10, raw: "\x1c", type: "TEXT" },
  ]);
});

test("unicode and high codepoints", () => {
  assert.deepEqual(tokenize("Hello \u{1F30D} World"), [{ pos: 0, raw: "Hello 🌍 World", type: "TEXT" }]);

  assert.deepEqual(tokenize(`\x1b]0;Title 👍🏻 𝒜\x07`), [
    { pos: 0, raw: "\x1b]", type: "INTRODUCER", code: "\x9d" },
    { pos: 2, raw: `0;Title \u{1F44D}\u{1F3FB} \u{1D49C}`, type: "DATA" },
    { pos: 17, raw: "\x07", type: "FINAL" },
  ]);
});
