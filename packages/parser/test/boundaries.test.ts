import { test } from "node:test";
import assert from "node:assert/strict";
import { parse } from "../src/index.ts";
import { parse as parseEscaped } from "../src/escaped.ts";

test("SOS and PM match their 7-bit and C1 introducers", () => {
  for (const [input, command] of [
    ["\x1bXhello\x1b\\", "SOS"],
    ["\x98hello\x9c", "SOS"],
    ["\x1b^hello\x1b\\", "PM"],
    ["\x9ehello\x9c", "PM"],
  ]) {
    const code = parse(input)[0];
    assert.equal(code.type, "STRING");
    assert.equal("command" in code && code.command, command);
    assert.equal(code.raw, input);
  }
  for (const [input, command] of [
    [String.raw`\eXhello\e\\`, "SOS"],
    [String.raw`\e^hello\e\\`, "PM"],
  ]) {
    const code = parseEscaped(input)[0];
    assert.equal(code.type, "STRING");
    assert.equal("command" in code && code.command, command);
    assert.equal(code.raw, input);
  }
});
