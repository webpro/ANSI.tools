import { test } from "node:test";
import assert from "node:assert/strict";
import { parseOSC } from "../src/parsers/osc.ts";
import type { TOKEN } from "../src/types.ts";

test("parseOSC simple command", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e]", code: "OSC" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: "8;;http://example.com" }];
  const final: TOKEN = { type: "FINAL", pos: 24, raw: "\\a" };
  assert.deepEqual(parseOSC(introducer, dataTokens, final), {
    type: "OSC",
    pos: 0,
    raw: "\\e]8;;http://example.com\\a",
    command: "8",
    params: ["", "http://example.com"],
  });
});

test("parseOSC no parameters", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e]", code: "OSC" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: "0" }];
  const final: TOKEN = { type: "FINAL", pos: 4, raw: "\\a" };
  assert.deepEqual(parseOSC(introducer, dataTokens, final), {
    type: "OSC",
    pos: 0,
    raw: "\\e]0\\a",
    command: "0",
    params: [],
  });
});

test("parseOSC with trailing semicolon (empty remainder)", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e]", code: "OSC" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: "8;" }];
  const final: TOKEN = { type: "FINAL", pos: 5, raw: "\\a" };
  assert.deepEqual(parseOSC(introducer, dataTokens, final), {
    type: "OSC",
    pos: 0,
    raw: "\\e]8;\\a",
    command: "8",
    params: [],
  });
});

test("parseOSC real-world example", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e]", code: "OSC" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: "2;Window Title" }];
  const final: TOKEN = { type: "FINAL", pos: 17, raw: "\\a" };
  assert.deepEqual(parseOSC(introducer, dataTokens, final), {
    type: "OSC",
    pos: 0,
    raw: "\\e]2;Window Title\\a",
    command: "2",
    params: ["Window Title"],
  });
});
