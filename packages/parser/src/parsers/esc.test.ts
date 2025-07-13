import { test } from "node:test";
import assert from "node:assert/strict";
import { parseESC } from "./esc.ts";
import { CODE_TYPES } from "../constants.ts";
import type { TOKEN } from "../types.ts";

test("parseESC simple command", () => {
  const token: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e", code: "ESC" };
  const result = parseESC(token, "\\e=", "=");
  assert.deepEqual(result, { type: CODE_TYPES.ESC, pos: 0, raw: "\\e=", command: "=", params: [] });
});

test("parseESC with data", () => {
  const token: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e(", code: "ESC", intermediate: "(" };
  const result = parseESC(token, "\\e(A", "A");
  assert.deepEqual(result, { type: CODE_TYPES.ESC, pos: 0, raw: "\\e(A", command: "(", params: ["A"] });
});

test("parseESC charset sequence", () => {
  const token: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e)", code: "ESC", intermediate: ")" };
  const result = parseESC(token, "\\e)A", "A");
  assert.deepEqual(result, { type: CODE_TYPES.ESC, pos: 0, raw: "\\e)A", command: ")", params: ["A"] });
});
