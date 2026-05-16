import assert from "node:assert/strict";
import { test } from "node:test";
import { parse } from "../src/parse.ts";
import { parse as parseEscaped } from "../src/parse.escaped.ts";
import { unescapeInput } from "./helpers.ts";

const sample = String.raw`text \x1b[1;31mred\x1b[0m \x1b[38;2;255;0;128mrgb\x1b[m \x1b]0;title\x07 \x1b]8;;https://example.com\x1b\\link\x1b]8;;\x07 \x1bPq~data\x1b\\ \x1b_apc\x1b\\ \x1b#3 \x1b(B \x1bM \x9b31m \x9d0;t\x07 plain`;

function rawJoin(codes: { raw: string }[]): string {
  let s = "";
  for (const c of codes) s += c.raw;
  return s;
}

test("escaped: full sample round-trips losslessly", () => {
  assert.equal(rawJoin(parseEscaped(sample)), sample);
});

test("raw: full sample round-trips losslessly", () => {
  const raw = unescapeInput(sample);
  assert.equal(rawJoin(parse(raw)), raw);
});

test("escaped: every prefix round-trips losslessly (truncation at every offset)", () => {
  for (let i = 0; i <= sample.length; i++) {
    const input = sample.slice(0, i);
    assert.equal(rawJoin(parseEscaped(input)), input, `escaped prefix length ${i}: ${JSON.stringify(input)}`);
  }
});

test("raw: every prefix round-trips losslessly (truncation at every offset)", () => {
  const raw = unescapeInput(sample);
  for (let i = 0; i <= raw.length; i++) {
    const input = raw.slice(0, i);
    assert.equal(rawJoin(parse(input)), input, `raw prefix length ${i}: ${JSON.stringify(input)}`);
  }
});

test("raw: every suffix round-trips losslessly", () => {
  const raw = unescapeInput(sample);
  for (let i = 0; i < raw.length; i++) {
    const input = raw.slice(i);
    assert.equal(rawJoin(parse(input)), input, `raw suffix from ${i}`);
  }
});
