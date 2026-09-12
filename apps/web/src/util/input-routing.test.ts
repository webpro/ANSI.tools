import assert from "node:assert/strict";
import { test } from "node:test";
import { parseInput } from "./parse-input.ts";

for (const [name, sequence, type, command] of [
  ["CSI", "\u009b31m", "CSI", "m"],
  ["OSC", "\u009d52;c;?\u009c", "OSC", "52"],
  ["DCS", "\u0090$qm\u009c", "DCS", "$q"],
  ["APC", "\u009fpayload\u009c", "STRING", "APC"],
  ["SOS", "\u0098payload\u009c", "STRING", "SOS"],
  ["PM", "\u009epayload\u009c", "STRING", "PM"],
]) {
  test(`raw C1 ${name} selects raw parsing`, () => {
    const state = parseInput(`${sequence}tail`);
    assert.equal(state.isRaw, true);
    assert.equal(state.plain, "tail");
    assert.deepEqual(state.codes.map(code => ({
      type: code.type,
      raw: code.raw,
      command: "command" in code ? code.command : undefined,
    })), [
      { type, raw: sequence, command },
      { type: "TEXT", raw: "tail", command: undefined },
    ]);
  });
}

test("raw ESC and escaped spellings retain their parsing paths", () => {
  for (const [input, isRaw] of [
    ["\u001b[31mtail", true],
    ["\\x1b[31mtail", false],
    ["\\u001b[31mtail", false],
    ["\\033[31mtail", false],
    ["\\e[31mtail", false],
  ] as const) {
    const state = parseInput(input);
    assert.equal(state.isRaw, isRaw, input);
    assert.equal(state.plain, "tail", input);
    assert.deepEqual(state.codes.map(code => code.type), ["CSI", "TEXT"], input);
  }
});

test("ordinary text and unsupported controls do not select raw parsing", () => {
  for (const input of [
    "plain text",
    "\\u009b31m",
    "\\x9d52;c;?\\x9c",
    "\u0019" + "6",
    "\u0091payload\u009c",
    "\u0096",
    "\u009c",
    "\u0007\u0018\u001a",
  ]) {
    assert.equal(parseInput(input).isRaw, false, JSON.stringify(input));
  }
});
