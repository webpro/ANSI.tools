import { test } from "node:test";
import type { CODE } from "../src/types.ts";
import "./helpers.ts";

test("empty", t => {
  const input = String.raw``;
  const expected: CODE[] = [];
  t.assert.equalCodesDual(input, expected);
});

test("plain text", t => {
  const input = String.raw`Hello, world!`;
  const expected = [{ type: "TEXT", pos: 0, raw: "Hello, world!" }];
  t.assert.equalCodesDual(input, expected);
});
