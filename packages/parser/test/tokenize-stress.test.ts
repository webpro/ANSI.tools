import { test } from "node:test";
import "./helpers.ts";
import { tokenize } from "../src/tokenize.ts";
import { tokenize as tokenizeEscaped } from "../src/tokenize.escaped.ts";

test("alternative introducer", t => {
  const input = String.raw`\e[31m`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "\x9b" },
    { type: "DATA", pos: 3, raw: "31" },
    { type: "FINAL", pos: 5, raw: "m" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("text and CSI", t => {
  const input = String.raw`hello \e[31mworld\e[0m`;
  const expected = [
    { type: "TEXT", pos: 0, raw: "hello " },
    { type: "INTRODUCER", pos: 6, raw: "\\e[", code: "\x9b" },
    { type: "DATA", pos: 9, raw: "31" },
    { type: "FINAL", pos: 11, raw: "m" },
    { type: "TEXT", pos: 12, raw: "world" },
    { type: "INTRODUCER", pos: 17, raw: "\\e[", code: "\x9b" },
    { type: "DATA", pos: 20, raw: "0" },
    { type: "FINAL", pos: 21, raw: "m" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("octal escape notation", t => {
  const input = String.raw`\033[31m`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\033[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "31" },
    { type: "FINAL", pos: 7, raw: "m" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("string sequences with different terminators", t => {
  const input = String.raw`\x1bPdata\x1b\\`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1bP", code: "P" },
    { type: "DATA", pos: 5, raw: "data" },
    { type: "FINAL", pos: 9, raw: "\\x1b\\\\" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("malformed sequences", t => {
  const input = String.raw`\x1b[`;
  const expected = [{ type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" }];
  t.assert.equalTokensDual(input, expected);
});

test("boundary characters", t => {
  const input = String.raw`\x1b[@@`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "FINAL", pos: 5, raw: "@" },
    { type: "TEXT", pos: 6, raw: "@" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("missing parameters", t => {
  const input = String.raw`\e[;5;m\e[?;h\eP$q;;\e\\`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "\x9b" },
    { type: "DATA", pos: 3, raw: ";5;" },
    { type: "FINAL", pos: 6, raw: "m" },
    { type: "INTRODUCER", pos: 7, raw: "\\e[", code: "\x9b" },
    { type: "DATA", pos: 10, raw: "?;" },
    { type: "FINAL", pos: 12, raw: "h" },
    { type: "INTRODUCER", pos: 13, raw: "\\eP", code: "P" },
    { type: "DATA", pos: 16, raw: "$q;;" },
    { type: "FINAL", pos: 20, raw: "\\e\\\\" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("parse DECUDK sequence", t => {
  const input = String.raw`\eP0|23/68656c6c6f\e\\`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\eP", code: "P" },
    { type: "DATA", pos: 3, raw: "0|23/68656c6c6f" },
    { type: "FINAL", pos: 18, raw: "\\e\\\\" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("parse iTerm2 image sequence", t => {
  const input = String.raw`\e]1337;File=inline=1;width=1;height=1:R0lG=\a`;
  const expected = [
    { code: "\x9D", pos: 0, raw: "\\e]", type: "INTRODUCER" },
    { pos: 3, raw: "1337;File=inline=1;width=1;height=1:R0lG=", type: "DATA" },
    { pos: 44, raw: "\\a", type: "FINAL" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("DCS interrupted by CSI", t => {
  const input = String.raw`\x1bPdata\x1b[31m`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1bP", code: "P" },
    { type: "DATA", pos: 5, raw: "data" },
    { type: "INTRODUCER", pos: 9, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 14, raw: "31" },
    { type: "FINAL", pos: 16, raw: "m" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("APC interrupted by ESC", t => {
  const input = String.raw`\x1b_payload\eHnext`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b_", code: "_" },
    { type: "DATA", pos: 5, raw: "payload" },
    { type: "INTRODUCER", pos: 12, raw: "\\e", code: "\x1b" },
    { type: "FINAL", pos: 14, raw: "H" },
    { type: "TEXT", pos: 15, raw: "next" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("OSC interrupted by DCS", t => {
  const input = String.raw`\x1b]0;title\x1bPnew`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 5, raw: "0;title" },
    { type: "INTRODUCER", pos: 12, raw: "\\x1bP", code: "P" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("CSI interrupted by CSI", t => {
  const input = String.raw`\x1b[31\x1b[32m`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "31" },
    { type: "INTRODUCER", pos: 7, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 12, raw: "32" },
    { type: "FINAL", pos: 14, raw: "m" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("CSI interrupted by incomplete CSI", t => {
  const input = String.raw`\x1b[31\x1b[32`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "31" },
    { type: "INTRODUCER", pos: 7, raw: "\\x1b[", code: "\x9b" },
  ];
  t.assert.equalTokensDual(input, expected);
});
