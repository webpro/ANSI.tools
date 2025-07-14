import { test } from "node:test";
import assert from "node:assert/strict";
import { parseOSC } from "../src/parsers/osc.ts";

test("parseOSC simple command", () => {
  assert.deepEqual(parseOSC(0, "\\e]8;;http://example.com\\a", "8;;http://example.com"), {
    type: "OSC",
    pos: 0,
    raw: "\\e]8;;http://example.com\\a",
    command: "8",
    params: ["", "http://example.com"],
  });
});

test("parseOSC no parameters", () => {
  assert.deepEqual(parseOSC(0, "\\e]0\\a", "0"), {
    type: "OSC",
    pos: 0,
    raw: "\\e]0\\a",
    command: "0",
    params: [],
  });
});

test("parseOSC with trailing semicolon (empty remainder)", () => {
  assert.deepEqual(parseOSC(0, "\\e]8;\\a", "8;"), {
    type: "OSC",
    pos: 0,
    raw: "\\e]8;\\a",
    command: "8",
    params: [],
  });
});

test("parseOSC real-world example", () => {
  assert.deepEqual(parseOSC(0, "\\e]2;Window Title\\a", "2;Window Title"), {
    type: "OSC",
    pos: 0,
    raw: "\\e]2;Window Title\\a",
    command: "2",
    params: ["Window Title"],
  });
});
