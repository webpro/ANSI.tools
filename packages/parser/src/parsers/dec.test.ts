import { test } from "node:test";
import assert from "node:assert/strict";
import { parseDEC } from "./dec.ts";
import { CODE_TYPES } from "../constants.ts";

test("parseDEC basic sequence", () => {
  const result = parseDEC(0, "\\e[?25h", "?25", "h");
  assert.deepEqual(result, { type: CODE_TYPES.DEC, pos: 0, raw: "\\e[?25h", params: ["25"], command: "h" });
});

test("parseDEC with missing parameters", () => {
  const result = parseDEC(0, "\\e[?;h", "?;", "h");
  assert.deepEqual(result, { type: CODE_TYPES.DEC, pos: 0, raw: "\\e[?;h", params: ["-1", "-1"], command: "h" });
});

test("parseDEC with intermediate bytes", () => {
  const result = parseDEC(0, "\\e[?1$p", "?1$", "p");
  assert.deepEqual(result, { type: CODE_TYPES.DEC, pos: 0, raw: "\\e[?1$p", params: ["1"], command: "$p" });
});

test("parseDEC multiple parameters with intermediates", () => {
  const result = parseDEC(0, "\\e[?1;2$p", "?1;2$", "p");
  assert.deepEqual(result, { type: CODE_TYPES.DEC, pos: 0, raw: "\\e[?1;2$p", params: ["1", "2"], command: "$p" });
});
