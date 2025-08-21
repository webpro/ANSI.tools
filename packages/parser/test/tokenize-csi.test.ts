import { test } from "node:test";

test("basic CSI", t => {
  const input = String.raw`\x1b[31m`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "31" },
    { type: "FINAL", pos: 7, raw: "m" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("8-bit CSI", t => {
  const input = String.raw`\u009b31m`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\u009b", code: "\x9b" },
    { type: "DATA", pos: 6, raw: "31" },
    { type: "FINAL", pos: 8, raw: "m" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("8-bit CSI with reset", t => {
  const input = String.raw`\u009b32mGreen text\u009b0m.`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\u009b", code: "\x9b" },
    { type: "DATA", pos: 6, raw: "32" },
    { type: "FINAL", pos: 8, raw: "m" },
    { type: "TEXT", pos: 9, raw: "Green text" },
    { type: "INTRODUCER", pos: 19, raw: "\\u009b", code: "\x9b" },
    { type: "DATA", pos: 25, raw: "0" },
    { type: "FINAL", pos: 26, raw: "m" },
    { type: "TEXT", pos: 27, raw: "." },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("CSI with params", t => {
  const input = String.raw`\x1b[10;20H`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "10;20" },
    { type: "FINAL", pos: 10, raw: "H" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("CSI with private params", t => {
  const input = String.raw`\x1b[?1049h`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "?1049" },
    { type: "FINAL", pos: 10, raw: "h" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("CSI with intermediate", t => {
  const input = String.raw`\x1b[20 q`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "20 " },
    { type: "FINAL", pos: 8, raw: "q" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("complex CSI with subparameters", t => {
  const input = String.raw`\x1b[38;2;255;128;0m`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "38;2;255;128;0" },
    { type: "FINAL", pos: 19, raw: "m" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("cursor movement commands", t => {
  const input = String.raw`\x1b[3A\x1b[4D\x1b[shello\x1b[J\x1b[1;3Hworld\x1b[u\x1b[13T`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "3" },
    { type: "FINAL", pos: 6, raw: "A" },
    { type: "INTRODUCER", pos: 7, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 12, raw: "4" },
    { type: "FINAL", pos: 13, raw: "D" },
    { type: "INTRODUCER", pos: 14, raw: "\\x1b[", code: "\x9b" },
    { type: "FINAL", pos: 19, raw: "s" },
    { type: "TEXT", pos: 20, raw: "hello" },
    { type: "INTRODUCER", pos: 25, raw: "\\x1b[", code: "\x9b" },
    { type: "FINAL", pos: 30, raw: "J" },
    { type: "INTRODUCER", pos: 31, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 36, raw: "1;3" },
    { type: "FINAL", pos: 39, raw: "H" },
    { type: "TEXT", pos: 40, raw: "world" },
    { type: "INTRODUCER", pos: 45, raw: "\\x1b[", code: "\x9b" },
    { type: "FINAL", pos: 50, raw: "u" },
    { type: "INTRODUCER", pos: 51, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 56, raw: "13" },
    { type: "FINAL", pos: 58, raw: "T" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("complex mixed content", t => {
  const input = String.raw`Hello\x1b[31mworld\x1b[39m!\x1b[1mBold\x1b[0m\x1b[42mGreen BG\x1b[49m.`;
  const expected = [
    { type: "TEXT", pos: 0, raw: "Hello" },
    { type: "INTRODUCER", pos: 5, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 10, raw: "31" },
    { type: "FINAL", pos: 12, raw: "m" },
    { type: "TEXT", pos: 13, raw: "world" },
    { type: "INTRODUCER", pos: 18, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 23, raw: "39" },
    { type: "FINAL", pos: 25, raw: "m" },
    { type: "TEXT", pos: 26, raw: "!" },
    { type: "INTRODUCER", pos: 27, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 32, raw: "1" },
    { type: "FINAL", pos: 33, raw: "m" },
    { type: "TEXT", pos: 34, raw: "Bold" },
    { type: "INTRODUCER", pos: 38, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 43, raw: "0" },
    { type: "FINAL", pos: 44, raw: "m" },
    { type: "INTRODUCER", pos: 45, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 50, raw: "42" },
    { type: "FINAL", pos: 52, raw: "m" },
    { type: "TEXT", pos: 53, raw: "Green BG" },
    { type: "INTRODUCER", pos: 61, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 66, raw: "49" },
    { type: "FINAL", pos: 68, raw: "m" },
    { type: "TEXT", pos: 69, raw: "." },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("sequences with no parameters", t => {
  const input = String.raw`\x1b[H`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "FINAL", pos: 5, raw: "H" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("nested-like sequences", t => {
  const input = String.raw`\x1b[38;5;196m`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "38;5;196" },
    { type: "FINAL", pos: 13, raw: "m" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("complex RGB colors", t => {
  const input = String.raw`\x1b[38;2;255;255;0mH\x1b[0;1;3;35me\x1b[95ml\x1b[42ml\x1b[0;41mo\x1b[0m`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "38;2;255;255;0" },
    { type: "FINAL", pos: 19, raw: "m" },
    { type: "TEXT", pos: 20, raw: "H" },
    { type: "INTRODUCER", pos: 21, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 26, raw: "0;1;3;35" },
    { type: "FINAL", pos: 34, raw: "m" },
    { type: "TEXT", pos: 35, raw: "e" },
    { type: "INTRODUCER", pos: 36, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 41, raw: "95" },
    { type: "FINAL", pos: 43, raw: "m" },
    { type: "TEXT", pos: 44, raw: "l" },
    { type: "INTRODUCER", pos: 45, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 50, raw: "42" },
    { type: "FINAL", pos: 52, raw: "m" },
    { type: "TEXT", pos: 53, raw: "l" },
    { type: "INTRODUCER", pos: 54, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 59, raw: "0;41" },
    { type: "FINAL", pos: 63, raw: "m" },
    { type: "TEXT", pos: 64, raw: "o" },
    { type: "INTRODUCER", pos: 65, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 70, raw: "0" },
    { type: "FINAL", pos: 71, raw: "m" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("mixed colors with unicode", t => {
  const input = String.raw`\u001b[31mRed\u001b[39m, \u001b[32mgreen\u001b[39m, and \u001b[44mblue background\u001b[49m.`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\u001b[", code: "\x9b" },
    { type: "DATA", pos: 7, raw: "31" },
    { type: "FINAL", pos: 9, raw: "m" },
    { type: "TEXT", pos: 10, raw: "Red" },
    { type: "INTRODUCER", pos: 13, raw: "\\u001b[", code: "\x9b" },
    { type: "DATA", pos: 20, raw: "39" },
    { type: "FINAL", pos: 22, raw: "m" },
    { type: "TEXT", pos: 23, raw: ", " },
    { type: "INTRODUCER", pos: 25, raw: "\\u001b[", code: "\x9b" },
    { type: "DATA", pos: 32, raw: "32" },
    { type: "FINAL", pos: 34, raw: "m" },
    { type: "TEXT", pos: 35, raw: "green" },
    { type: "INTRODUCER", pos: 40, raw: "\\u001b[", code: "\x9b" },
    { type: "DATA", pos: 47, raw: "39" },
    { type: "FINAL", pos: 49, raw: "m" },
    { type: "TEXT", pos: 50, raw: ", and " },
    { type: "INTRODUCER", pos: 56, raw: "\\u001b[", code: "\x9b" },
    { type: "DATA", pos: 63, raw: "44" },
    { type: "FINAL", pos: 65, raw: "m" },
    { type: "TEXT", pos: 66, raw: "blue background" },
    { type: "INTRODUCER", pos: 81, raw: "\\u001b[", code: "\x9b" },
    { type: "DATA", pos: 88, raw: "49" },
    { type: "FINAL", pos: 90, raw: "m" },
    { type: "TEXT", pos: 91, raw: "." },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("text styling sequences", t => {
  const input = String.raw`\x1b[1mBold\x1b[22m\x1b[3mItalic\x1b[23m\x1b[4mUnderline\x1b[24m\x1b[9mStrike\x1b[29m`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "1" },
    { type: "FINAL", pos: 6, raw: "m" },
    { type: "TEXT", pos: 7, raw: "Bold" },
    { type: "INTRODUCER", pos: 11, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 16, raw: "22" },
    { type: "FINAL", pos: 18, raw: "m" },
    { type: "INTRODUCER", pos: 19, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 24, raw: "3" },
    { type: "FINAL", pos: 25, raw: "m" },
    { type: "TEXT", pos: 26, raw: "Italic" },
    { type: "INTRODUCER", pos: 32, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 37, raw: "23" },
    { type: "FINAL", pos: 39, raw: "m" },
    { type: "INTRODUCER", pos: 40, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 45, raw: "4" },
    { type: "FINAL", pos: 46, raw: "m" },
    { type: "TEXT", pos: 47, raw: "Underline" },
    { type: "INTRODUCER", pos: 56, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 61, raw: "24" },
    { type: "FINAL", pos: 63, raw: "m" },
    { type: "INTRODUCER", pos: 64, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 69, raw: "9" },
    { type: "FINAL", pos: 70, raw: "m" },
    { type: "TEXT", pos: 71, raw: "Strike" },
    { type: "INTRODUCER", pos: 77, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 82, raw: "29" },
    { type: "FINAL", pos: 84, raw: "m" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("various command sequences", t => {
  const input = String.raw`\x1b[2J\x1b[H\x1b[?25l\x1b[1;1H\x1b[K\x1b[6n\x1b[20l`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "2" },
    { type: "FINAL", pos: 6, raw: "J" },
    { type: "INTRODUCER", pos: 7, raw: "\\x1b[", code: "\x9b" },
    { type: "FINAL", pos: 12, raw: "H" },
    { type: "INTRODUCER", pos: 13, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 18, raw: "?25" },
    { type: "FINAL", pos: 21, raw: "l" },
    { type: "INTRODUCER", pos: 22, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 27, raw: "1;1" },
    { type: "FINAL", pos: 30, raw: "H" },
    { type: "INTRODUCER", pos: 31, raw: "\\x1b[", code: "\x9b" },
    { type: "FINAL", pos: 36, raw: "K" },
    { type: "INTRODUCER", pos: 37, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 42, raw: "6" },
    { type: "FINAL", pos: 43, raw: "n" },
    { type: "INTRODUCER", pos: 44, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 49, raw: "20" },
    { type: "FINAL", pos: 51, raw: "l" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("iTerm2 SetUserVar", t => {
  const input = String.raw`\x1b]1337;SetUserVar=foo=YmFy\x07`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 5, raw: "1337;SetUserVar=foo=YmFy" },
    { type: "FINAL", pos: 29, raw: "\\x07" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("very long sequences", t => {
  const longParams = Array(50).fill("1").join(";");
  const input = String.raw`\x1b[${longParams}m`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    {
      type: "DATA",
      pos: 5,
      raw: "1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1",
    },
    { type: "FINAL", pos: 104, raw: "m" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("malformed mixed 8-bit and 7-bit CSI", t => {
  const input = String.raw`\x9b38;5;1mhello\x9b[0m`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x9b", code: "\x9b" },
    { type: "DATA", pos: 4, raw: "38;5;1" },
    { type: "FINAL", pos: 10, raw: "m" },
    { type: "TEXT", pos: 11, raw: "hello" },
    { type: "INTRODUCER", pos: 16, raw: "\\x9b", code: "\x9b" },
    { type: "FINAL", pos: 20, raw: "[" },
    { type: "TEXT", pos: 21, raw: "0m" },
  ];
  t.assert.equalTokensDual(input, expected);
});
