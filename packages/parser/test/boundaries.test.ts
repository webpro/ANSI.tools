import { test } from "node:test";
import assert from "node:assert/strict";
import { parse, parser, tokenize, tokenizer } from "../src/index.ts";
import { parse as parseEscaped, tokenize as tokenizeEscaped, tokenizer as tokenizerEscaped } from "../src/escaped.ts";

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

test("NUL is ignored inside raw ESC and CSI without moving sequence boundaries", () => {
  for (const [input, command, params, tailPos] of [
    ["\x1b\x00Dtail", "D", [], 3],
    ["\x1b(\x00Btail", "(", ["B"], 4],
    ["\x1b\x00(\x00Btail", "(", ["B"], 5],
    ["\x1b\x00[31mtail", "m", ["31"], 6],
    ["\x1b[3\x001mtail", "m", ["31"], 6],
    ["\x1b[\x0031\x00mtail", "m", ["31"], 7],
    ["\x1b[1\x00 qtail", " q", ["1"], 6],
  ] as const) {
    const codes = parse(input);
    assert.equal(codes.length, 2);
    assert.equal("command" in codes[0] && codes[0].command, command);
    assert.deepEqual("params" in codes[0] && codes[0].params, params);
    assert.deepEqual(codes[1], { type: "TEXT", pos: tailPos, raw: "tail" });
    assert.equal(codes.map(code => code.raw).join(""), input);
    assert.deepEqual(Array.from(parser(tokenizer(input))), codes);
    assert.deepEqual(Array.from(tokenizer(input)), tokenize(input));
  }
});

test("ignored NUL tokens retain source positions and incomplete data", () => {
  assert.deepEqual(tokenize("\x1b[3\x001m"), [
    { type: "INTRODUCER", pos: 0, raw: "\x1b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "3" },
    { type: "DATA", pos: 3, raw: "\x00", code: "" },
    { type: "DATA", pos: 4, raw: "1" },
    { type: "FINAL", pos: 5, raw: "m" },
  ]);
  assert.deepEqual(tokenizeEscaped(String.raw`\e[3\x001`), [
    { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "\x9b" },
    { type: "DATA", pos: 3, raw: "3" },
    { type: "DATA", pos: 4, raw: "\\x00", code: "" },
    { type: "DATA", pos: 8, raw: "1" },
  ]);
  assert.deepEqual(tokenize("\x1b\x00"), [{ type: "INTRODUCER", pos: 0, raw: "\x1b\x00", code: "\x1b" }]);
  assert.deepEqual(tokenizeEscaped(String.raw`\e\u0000`), [
    { type: "INTRODUCER", pos: 0, raw: "\\e\\u0000", code: "\x1b" },
  ]);
});

test("NUL data inside OSC strings remains inspectable", () => {
  assert.deepEqual(parse("\x1b]2;a\x00b\x07")[0], {
    type: "OSC",
    pos: 0,
    raw: "\x1b]2;a\x00b\x07",
    command: "2",
    params: ["a\x00b"],
  });
  assert.deepEqual(parseEscaped(String.raw`\e]2;a\x00b\a`)[0], {
    type: "OSC",
    pos: 0,
    raw: "\\e]2;a\\x00b\\a",
    command: "2",
    params: ["a\\x00b"],
  });
});

test("escaped NUL is ignored inside ESC and CSI", () => {
  for (const [input, command, params, tailPos] of [
    [String.raw`\e\x00Dtail`, "D", [], 7],
    [String.raw`\e(\u0000Btail`, "(", ["B"], 10],
    [String.raw`\e\x00[31mtail`, "m", ["31"], 10],
    [String.raw`\e[3\x001mtail`, "m", ["31"], 10],
    [String.raw`\e[\u000031\x00mtail`, "m", ["31"], 16],
  ] as const) {
    const codes = parseEscaped(input);
    assert.equal(codes.length, 2);
    assert.equal("command" in codes[0] && codes[0].command, command);
    assert.deepEqual("params" in codes[0] && codes[0].params, params);
    assert.deepEqual(codes[1], { type: "TEXT", pos: tailPos, raw: "tail" });
    assert.equal(codes.map(code => code.raw).join(""), input);
    assert.deepEqual(Array.from(parser(tokenizerEscaped(input))), codes);
    assert.deepEqual(Array.from(tokenizerEscaped(input)), tokenizeEscaped(input));
  }
});
