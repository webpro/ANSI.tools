import { test } from "node:test";

test("ESC with charset", t => {
  const input = String.raw`\x1b(B`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b(", code: "\u001b", intermediate: "(" },
    { type: "FINAL", pos: 5, raw: "B" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("simple ESC sequence", t => {
  const input = String.raw`\x1bc`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b", code: "\u001b" },
    { type: "FINAL", pos: 4, raw: "c" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("unicode ESC variants", t => {
  const input = String.raw`\u001b[2q`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\u001b[", code: "\x9b" },
    { type: "DATA", pos: 7, raw: "2" },
    { type: "FINAL", pos: 8, raw: "q" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("mixed text and sequences", t => {
  const input = String.raw`Hello\x1b[31mworld\x1b[0m!`;
  const expected = [
    { type: "TEXT", pos: 0, raw: "Hello" },
    { type: "INTRODUCER", pos: 5, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 10, raw: "31" },
    { type: "FINAL", pos: 12, raw: "m" },
    { type: "TEXT", pos: 13, raw: "world" },
    { type: "INTRODUCER", pos: 18, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 23, raw: "0" },
    { type: "FINAL", pos: 24, raw: "m" },
    { type: "TEXT", pos: 25, raw: "!" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("multiple consecutive sequences", t => {
  const input = String.raw`\x1b[31m\x1b[1m\x1b[4m`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "31" },
    { type: "FINAL", pos: 7, raw: "m" },
    { type: "INTRODUCER", pos: 8, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 13, raw: "1" },
    { type: "FINAL", pos: 14, raw: "m" },
    { type: "INTRODUCER", pos: 15, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 20, raw: "4" },
    { type: "FINAL", pos: 21, raw: "m" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("ESC sequence variations", t => {
  const input = String.raw`\x1b#8`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b#", code: "\u001b", intermediate: "#" },
    { type: "FINAL", pos: 5, raw: "8" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("empty sequences", t => {
  const input = String.raw`\x1b[m`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "FINAL", pos: 5, raw: "m" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("sequences with trailing semicolons", t => {
  const input = String.raw`\x1b[31;m`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "31;" },
    { type: "FINAL", pos: 8, raw: "m" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("ESC with multiple intermediate bytes", t => {
  const input = String.raw`\x1b !A`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b !", code: "\x1B", intermediate: " !" },
    { type: "FINAL", pos: 6, raw: "A" },
  ];
  t.assert.equalTokensDual(input, expected);
});
