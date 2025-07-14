import { test } from "node:test";
import assert from "node:assert/strict";
import { parseESC } from "../src/parsers/esc.ts";
import type { TOKEN } from "../src/types.ts";

test("parseESC simple command", () => {
  const token: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e", code: "ESC" };
  assert.deepEqual(parseESC(token, "\\e=", "="), { type: "ESC", pos: 0, raw: "\\e=", command: "=", params: [] });
});

test("parseESC with data", () => {
  const token: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e(", code: "ESC", intermediate: "(" };
  assert.deepEqual(parseESC(token, "\\e(A", "A"), { type: "ESC", pos: 0, raw: "\\e(A", command: "(", params: ["A"] });
});

test("parseESC charset sequence", () => {
  const token: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e)", code: "ESC", intermediate: ")" };
  assert.deepEqual(parseESC(token, "\\e)A", "A"), { type: "ESC", pos: 0, raw: "\\e)A", command: ")", params: ["A"] });
});
