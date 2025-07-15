import { test } from "node:test";
import assert from "node:assert/strict";
import { parseESC } from "../src/parsers/esc.ts";
import type { TOKEN } from "../src/types.ts";

test("parseESC simple command", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e", code: "ESC" };
  const final: TOKEN = { type: "FINAL", pos: 3, raw: "=" };
  assert.deepEqual(parseESC(introducer, [], final), { type: "ESC", pos: 0, raw: "\\e=", command: "=", params: [] });
});

test("parseESC with data", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e(", code: "ESC", intermediate: "(" };
  const final: TOKEN = { type: "FINAL", pos: 3, raw: "A" };
  assert.deepEqual(parseESC(introducer, [], final), {
    type: "ESC",
    pos: 0,
    raw: "\\e(A",
    command: "(",
    params: ["A"],
  });
});

test("parseESC charset sequence", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e)", code: "ESC", intermediate: ")" };
  const final: TOKEN = { type: "FINAL", pos: 3, raw: "A" };
  assert.deepEqual(parseESC(introducer, [], final), {
    type: "ESC",
    pos: 0,
    raw: "\\e)A",
    command: ")",
    params: ["A"],
  });
});
