import { test } from "node:test";
import assert from "node:assert/strict";
import { tokenizer } from "./tokenize.escaped.ts";
import { parser } from "./parse.ts";
import { CODE_TYPES } from "./constants.ts";

test("parse simple text", () => {
  const input = "hello world";
  const tokens = tokenizer(input);
  const codes = [...parser(tokens)];
  assert.deepEqual(codes, [{ type: CODE_TYPES.TEXT, pos: 0, raw: "hello world" }]);
});

test("parse mixed text and csi", () => {
  const input = String.raw`hello \e[31mworld\e[0m`;
  const tokens = tokenizer(input);
  const codes = [...parser(tokens)];
  assert.deepEqual(codes, [
    { type: CODE_TYPES.TEXT, pos: 0, raw: "hello " },
    { type: CODE_TYPES.CSI, pos: 6, raw: "\\e[31m", params: ["31"], command: "m" },
    { type: CODE_TYPES.TEXT, pos: 12, raw: "world" },
    { type: CODE_TYPES.CSI, pos: 17, raw: "\\e[0m", params: ["0"], command: "m" },
  ]);
});

test("subsequent escape sequences", () => {
  const input = String.raw`\e[31m\e[32m\e[33m`;
  const tokens = tokenizer(input);
  const codes = [...parser(tokens)];
  assert.deepEqual(codes, [
    { type: CODE_TYPES.CSI, pos: 0, raw: "\\e[31m", params: ["31"], command: "m" },
    { type: CODE_TYPES.CSI, pos: 6, raw: "\\e[32m", params: ["32"], command: "m" },
    { type: CODE_TYPES.CSI, pos: 12, raw: "\\e[33m", params: ["33"], command: "m" },
  ]);
});

test("parse multiple different sequence types", () => {
  const input = String.raw`\e[1;32m\e]0;title\a\e=\ePdata\e\\`;
  const tokens = tokenizer(input);
  const codes = [...parser(tokens)];
  assert.deepEqual(codes, [
    { type: CODE_TYPES.CSI, pos: 0, raw: "\\e[1;32m", params: ["1", "32"], command: "m" },
    { type: CODE_TYPES.OSC, pos: 8, raw: "\\e]0;title\\a", params: ["title"], command: "0" },
    { type: CODE_TYPES.ESC, pos: 20, raw: "\\e=", command: "=", params: [] },
    { type: CODE_TYPES.DCS, pos: 23, raw: "\\ePdata\\e\\\\", params: ["data"], command: "" },
  ]);
});

test("parse mixed standard and private sequences", () => {
  const input = String.raw`\e[31m\e[<5h\e[?25l\e[>c`;
  const tokens = tokenizer(input);
  const codes = [...parser(tokens)];
  assert.deepEqual(codes, [
    { type: CODE_TYPES.CSI, pos: 0, raw: "\\e[31m", params: ["31"], command: "m" },
    { type: CODE_TYPES.PRIVATE, pos: 6, raw: "\\e[<5h", params: ["5"], command: "<h" },
    { type: CODE_TYPES.DEC, pos: 12, raw: "\\e[?25l", params: ["25"], command: "l" },
    { type: CODE_TYPES.PRIVATE, pos: 19, raw: "\\e[>c", params: [], command: ">c" },
  ]);
});

test("parse complex missing parameter scenarios", () => {
  const input = String.raw`\e[;5;m\e[?;h\eP$q;;\e\\`;
  const tokens = tokenizer(input);
  const codes = [...parser(tokens)];
  assert.deepEqual(codes, [
    { type: CODE_TYPES.CSI, pos: 0, raw: "\\e[;5;m", params: ["-1", "5", "-1"], command: "m" },
    { type: CODE_TYPES.DEC, pos: 7, raw: "\\e[?;h", params: ["-1", "-1"], command: "h" },
    { type: CODE_TYPES.DCS, pos: 13, raw: "\\eP$q;;\\e\\\\", params: ["-1", "-1", "-1"], command: "$q" },
  ]);
});

test("parse iTerm2 image sequence", () => {
  const input = String.raw`\e]1337;File=inline=1;width=1;height=1:R0lG=\a`;
  const tokens = tokenizer(input);
  const codes = [...parser(tokens)];
  assert.deepEqual(codes, [
    { type: CODE_TYPES.OSC, pos: 0, raw: input, command: "1337", params: ["File=inline=1;width=1;height=1:R0lG="] },
  ]);
});

test("parse DECUDK sequence", () => {
  const input = String.raw`\eP0|23/68656c6c6f\e\\`;
  const tokens = tokenizer(input);
  const codes = [...parser(tokens)];
  assert.deepEqual(codes, [{ type: CODE_TYPES.DCS, pos: 0, raw: input, command: "", params: ["0|23/68656c6c6f"] }]);
});
