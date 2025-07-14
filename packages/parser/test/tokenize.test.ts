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

test("text with special characters", () => {
  assert.deepEqual(tokenize("Hello\nWorld\t!"), [{ pos: 0, raw: "Hello\nWorld\t!", type: "TEXT" }]);
  assert.deepEqual(tokenizeEscaped(String.raw`Hello\nWorld\t!`), [{ pos: 0, raw: "Hello\\nWorld\\t!", type: "TEXT" }]);
});
