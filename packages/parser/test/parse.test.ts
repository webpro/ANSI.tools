import { test } from "node:test";
import assert from "node:assert/strict";
import { parse } from "../src/parse.ts";
import { parse as parseEscaped } from "../src/parse.escaped.ts";

test("empty", () => {
  assert.deepEqual(parse(""), []);
  assert.deepEqual(parseEscaped(String.raw``), []);
});

test("plain text", () => {
  assert.deepEqual(parse("Hello, world!"), [
    {
      type: "TEXT",
      pos: 0,
      raw: "Hello, world!",
    },
  ]);
  assert.deepEqual(parseEscaped(String.raw`Hello, world!`), [
    {
      type: "TEXT",
      pos: 0,
      raw: "Hello, world!",
    },
  ]);
});
