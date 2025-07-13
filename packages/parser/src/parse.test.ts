import { test } from "node:test";
import assert from "node:assert/strict";
import { tokenizer } from "./tokenize.ts";
import { parser } from "./parse.ts";
import { CODE_TYPES } from "./constants.ts";

test("parse simple text", () => {
  const input = "hello world";
  const tokens = tokenizer(input);
  const codes = [...parser(tokens)];
  assert.deepEqual(codes, [{ type: CODE_TYPES.TEXT, pos: 0, raw: "hello world" }]);
});

test("parse mixed text and csi", () => {
  const input = `hello \x1b[31mworld\x1b[0m`;
  const tokens = tokenizer(input);
  const codes = [...parser(tokens)];
  assert.deepEqual(codes, [
    { type: CODE_TYPES.TEXT, pos: 0, raw: "hello " },
    { type: CODE_TYPES.CSI, pos: 6, raw: "\x1b[31m", params: ["31"], command: "m" },
    { type: CODE_TYPES.TEXT, pos: 11, raw: "world" },
    { type: CODE_TYPES.CSI, pos: 16, raw: "\x1b[0m", params: ["0"], command: "m" },
  ]);
});

test("subsequent escape sequences", () => {
  const input = `\x1b[31m\x1b[32m\x1b[33m`;
  const tokens = tokenizer(input);
  const codes = [...parser(tokens)];
  assert.deepEqual(codes, [
    { type: CODE_TYPES.CSI, pos: 0, raw: "\x1b[31m", params: ["31"], command: "m" },
    { type: CODE_TYPES.CSI, pos: 5, raw: "\x1b[32m", params: ["32"], command: "m" },
    { type: CODE_TYPES.CSI, pos: 10, raw: "\x1b[33m", params: ["33"], command: "m" },
  ]);
});

test("parse multiple different sequence types", () => {
  const input = `\x1b[1;32m\x1b]0;title\x07\x1b=\x1bPdata\x1b\\`;
  const tokens = tokenizer(input);
  const codes = [...parser(tokens)];
  assert.deepEqual(codes, [
    { type: CODE_TYPES.CSI, pos: 0, raw: "\x1b[1;32m", params: ["1", "32"], command: "m" },
    { type: CODE_TYPES.OSC, pos: 7, raw: "\x1b]0;title\x07", params: ["title"], command: "0" },
    { type: CODE_TYPES.ESC, pos: 17, raw: "\x1b=", command: "=", params: [] },
    { type: CODE_TYPES.DCS, pos: 19, raw: "\x1bPdata\x1b\\", params: ["data"], command: "" },
  ]);
});

test("parse mixed standard and private sequences", () => {
  const input = `\x1b[31m\x1b[<5h\x1b[?25l\x1b[>c`;
  const tokens = tokenizer(input);
  const codes = [...parser(tokens)];
  assert.deepEqual(codes, [
    { type: CODE_TYPES.CSI, pos: 0, raw: "\x1b[31m", params: ["31"], command: "m" },
    { type: CODE_TYPES.PRIVATE, pos: 5, raw: "\x1b[<5h", params: ["5"], command: "<h" },
    { type: CODE_TYPES.DEC, pos: 10, raw: "\x1b[?25l", params: ["25"], command: "l" },
    { type: CODE_TYPES.PRIVATE, pos: 16, raw: "\x1b[>c", params: [], command: ">c" },
  ]);
});

test("parse complex missing parameter scenarios", () => {
  const input = `\x1b[;5;m\x1b[?;h\x1bP$q;;\x1b\\`;
  const tokens = tokenizer(input);
  const codes = [...parser(tokens)];
  assert.deepEqual(codes, [
    { type: CODE_TYPES.CSI, pos: 0, raw: "\x1b[;5;m", params: ["-1", "5", "-1"], command: "m" },
    { type: CODE_TYPES.DEC, pos: 6, raw: "\x1b[?;h", params: ["-1", "-1"], command: "h" },
    { type: CODE_TYPES.DCS, pos: 11, raw: "\x1bP$q;;\x1b\\", params: ["-1", "-1", "-1"], command: "$q" },
  ]);
});

test("parse iTerm2 image sequence", () => {
  const input = `\x1b]1337;File=inline=1;width=1;height=1:R0lG=\x07`;
  const tokens = tokenizer(input);
  const codes = [...parser(tokens)];
  assert.deepEqual(codes, [
    { type: CODE_TYPES.OSC, pos: 0, raw: input, command: "1337", params: ["File=inline=1;width=1;height=1:R0lG="] },
  ]);
});

test("parse DECUDK sequence", () => {
  const input = `\x1bP0|23/68656c6c6f\x1b\\`;
  const tokens = tokenizer(input);
  const codes = [...parser(tokens)];
  assert.deepEqual(codes, [{ type: CODE_TYPES.DCS, pos: 0, raw: input, command: "", params: ["0|23/68656c6c6f"] }]);
});
