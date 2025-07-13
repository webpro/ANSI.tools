import { test } from "node:test";
import assert from "node:assert/strict";
import { parseOSC } from "./osc.ts";
import { CODE_TYPES } from "../constants.ts";

test("parseOSC simple command", () => {
  const result = parseOSC(0, "\\e]8;;http://example.com\\a", "8;;http://example.com");
  assert.deepEqual(result, {
    type: CODE_TYPES.OSC,
    pos: 0,
    raw: "\\e]8;;http://example.com\\a",
    params: ["", "http://example.com"],
    command: "8",
  });
});

test("parseOSC no parameters", () => {
  const result = parseOSC(0, "\\e]0\\a", "0");
  assert.deepEqual(result, { type: CODE_TYPES.OSC, pos: 0, raw: "\\e]0\\a", command: "0", params: [] });
});

test("parseOSC with trailing semicolon (empty remainder)", () => {
  const result = parseOSC(0, "\\e]8;\\a", "8;");
  assert.deepEqual(result, { type: CODE_TYPES.OSC, pos: 0, raw: "\\e]8;\\a", command: "8", params: [] });
});

test("parseOSC real-world example", () => {
  const result = parseOSC(0, "\\e]2;Window Title\\a", "2;Window Title");
  assert.deepEqual(result, {
    type: CODE_TYPES.OSC,
    pos: 0,
    raw: "\\e]2;Window Title\\a",
    command: "2",
    params: ["Window Title"],
  });
});
