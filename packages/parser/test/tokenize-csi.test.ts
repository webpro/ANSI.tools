import { test } from "node:test";
import assert from "node:assert/strict";
import { tokenize } from "../src/tokenize.ts";
import { tokenize as tokenizeEscaped } from "../src/tokenize.escaped.ts";

test("basic CSI", () => {
  assert.deepEqual(tokenize("\x1b[31m"), [
    { type: "INTRODUCER", pos: 0, raw: "\x1b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "31" },
    { type: "FINAL", pos: 4, raw: "m" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b[31m`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "31" },
    { type: "FINAL", pos: 7, raw: "m" },
  ]);
});

test("8-bit CSI", () => {
  assert.deepEqual(tokenize("\u009b31m"), [
    { type: "INTRODUCER", pos: 0, raw: "\x9b", code: "\x9b" },
    { type: "DATA", pos: 1, raw: "31" },
    { type: "FINAL", pos: 3, raw: "m" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\u009b31m`), [
    { type: "INTRODUCER", pos: 0, raw: "\\u009b", code: "\x9b" },
    { type: "DATA", pos: 6, raw: "31" },
    { type: "FINAL", pos: 8, raw: "m" },
  ]);
});

test("8-bit CSI with reset", () => {
  assert.deepEqual(tokenize("\u009b32mGreen text\u009b0m."), [
    { type: "INTRODUCER", pos: 0, raw: "\x9b", code: "\x9b" },
    { type: "DATA", pos: 1, raw: "32" },
    { type: "FINAL", pos: 3, raw: "m" },
    { type: "TEXT", pos: 4, raw: "Green text" },
    { type: "INTRODUCER", pos: 14, raw: "\x9b", code: "\x9b" },
    { type: "DATA", pos: 15, raw: "0" },
    { type: "FINAL", pos: 16, raw: "m" },
    { type: "TEXT", pos: 17, raw: "." },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\u009b32mGreen text\u009b0m.`), [
    { type: "INTRODUCER", pos: 0, raw: "\\u009b", code: "\x9b" },
    { type: "DATA", pos: 6, raw: "32" },
    { type: "FINAL", pos: 8, raw: "m" },
    { type: "TEXT", pos: 9, raw: "Green text" },
    { type: "INTRODUCER", pos: 19, raw: "\\u009b", code: "\x9b" },
    { type: "DATA", pos: 25, raw: "0" },
    { type: "FINAL", pos: 26, raw: "m" },
    { type: "TEXT", pos: 27, raw: "." },
  ]);
});

test("CSI with params", () => {
  assert.deepEqual(tokenize("\x1b[10;20H"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "10;20" },
    { type: "FINAL", pos: 7, raw: "H" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b[10;20H`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "10;20" },
    { type: "FINAL", pos: 10, raw: "H" },
  ]);
});

test("CSI with private params", () => {
  assert.deepEqual(tokenize("\x1b[?1049h"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "?1049" },
    { type: "FINAL", pos: 7, raw: "h" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b[?1049h`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "?1049" },
    { type: "FINAL", pos: 10, raw: "h" },
  ]);
});

test("CSI with intermediate", () => {
  assert.deepEqual(tokenize("\x1b[20 q"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "20 " },
    { type: "FINAL", pos: 5, raw: "q" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b[20 q`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "20 " },
    { type: "FINAL", pos: 8, raw: "q" },
  ]);
});

test("complex CSI with subparameters", () => {
  assert.deepEqual(tokenize("\x1b[38;2;255;128;0m"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "38;2;255;128;0" },
    { type: "FINAL", pos: 16, raw: "m" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b[38;2;255;128;0m`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "38;2;255;128;0" },
    { type: "FINAL", pos: 19, raw: "m" },
  ]);
});

test("unicode CSI", () => {
  // This test is identical to "8-bit CSI" above, so we can use the same assertions   assert.deepEqual(tokenize("\u009b31m"), [     {       type: "INTRODUCER",       pos: 0,       raw: "\x9b",       code: "\x9b",     },     {       type: "DATA",       pos: 1,       raw: "31",     },     {       type: "FINAL",       pos: 3,       raw: "m",     },   ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\u009b31m`), [
    { type: "INTRODUCER", pos: 0, raw: "\\u009b", code: "\x9b" },
    { type: "DATA", pos: 6, raw: "31" },
    { type: "FINAL", pos: 8, raw: "m" },
  ]);
});

test("complex RGB colors", () => {
  assert.deepEqual(tokenize("\x1b[38;2;255;255;0mH\x1b[0;1;3;35me\x1b[95ml\x1b[42ml\x1b[0;41mo\x1b[0m"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "38;2;255;255;0" },
    { type: "FINAL", pos: 16, raw: "m" },
    { type: "TEXT", pos: 17, raw: "H" },
    { type: "INTRODUCER", pos: 18, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 20, raw: "0;1;3;35" },
    { type: "FINAL", pos: 28, raw: "m" },
    { type: "TEXT", pos: 29, raw: "e" },
    { type: "INTRODUCER", pos: 30, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 32, raw: "95" },
    { type: "FINAL", pos: 34, raw: "m" },
    { type: "TEXT", pos: 35, raw: "l" },
    { type: "INTRODUCER", pos: 36, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 38, raw: "42" },
    { type: "FINAL", pos: 40, raw: "m" },
    { type: "TEXT", pos: 41, raw: "l" },
    { type: "INTRODUCER", pos: 42, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 44, raw: "0;41" },
    { type: "FINAL", pos: 48, raw: "m" },
    { type: "TEXT", pos: 49, raw: "o" },
    { type: "INTRODUCER", pos: 50, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 52, raw: "0" },
    { type: "FINAL", pos: 53, raw: "m" },
  ]);

  assert.deepEqual(
    tokenizeEscaped(String.raw`\x1b[38;2;255;255;0mH\x1b[0;1;3;35me\x1b[95ml\x1b[42ml\x1b[0;41mo\x1b[0m`),
    [
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
    ]
  );
});

test("mixed colors with unicode", () => {
  assert.deepEqual(
    tokenize("\u001b[31mRed\u001b[39m, \u001b[32mgreen\u001b[39m, and \u001b[44mblue background\u001b[49m."),
    [
      { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
      { type: "DATA", pos: 2, raw: "31" },
      { type: "FINAL", pos: 4, raw: "m" },
      { type: "TEXT", pos: 5, raw: "Red" },
      { type: "INTRODUCER", pos: 8, raw: "\u001b[", code: "\x9b" },
      { type: "DATA", pos: 10, raw: "39" },
      { type: "FINAL", pos: 12, raw: "m" },
      { type: "TEXT", pos: 13, raw: ", " },
      { type: "INTRODUCER", pos: 15, raw: "\u001b[", code: "\x9b" },
      { type: "DATA", pos: 17, raw: "32" },
      { type: "FINAL", pos: 19, raw: "m" },
      { type: "TEXT", pos: 20, raw: "green" },
      { type: "INTRODUCER", pos: 25, raw: "\u001b[", code: "\x9b" },
      { type: "DATA", pos: 27, raw: "39" },
      { type: "FINAL", pos: 29, raw: "m" },
      { type: "TEXT", pos: 30, raw: ", and " },
      { type: "INTRODUCER", pos: 36, raw: "\u001b[", code: "\x9b" },
      { type: "DATA", pos: 38, raw: "44" },
      { type: "FINAL", pos: 40, raw: "m" },
      { type: "TEXT", pos: 41, raw: "blue background" },
      { type: "INTRODUCER", pos: 56, raw: "\u001b[", code: "\x9b" },
      { type: "DATA", pos: 58, raw: "49" },
      { type: "FINAL", pos: 60, raw: "m" },
      { type: "TEXT", pos: 61, raw: "." },
    ]
  );

  assert.deepEqual(
    tokenizeEscaped(
      String.raw`\u001b[31mRed\u001b[39m, \u001b[32mgreen\u001b[39m, and \u001b[44mblue background\u001b[49m.`
    ),
    [
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
    ]
  );
});

test("cursor movement commands", () => {
  assert.deepEqual(tokenize("\x1b[3A\x1b[4D\x1b[shello\x1b[J\x1b[1;3Hworld\x1b[u\x1b[13T"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "3" },
    { type: "FINAL", pos: 3, raw: "A" },
    { type: "INTRODUCER", pos: 4, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 6, raw: "4" },
    { type: "FINAL", pos: 7, raw: "D" },
    { type: "INTRODUCER", pos: 8, raw: "\u001b[", code: "\x9b" },
    { type: "FINAL", pos: 10, raw: "s" },
    { type: "TEXT", pos: 11, raw: "hello" },
    { type: "INTRODUCER", pos: 16, raw: "\u001b[", code: "\x9b" },
    { type: "FINAL", pos: 18, raw: "J" },
    { type: "INTRODUCER", pos: 19, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 21, raw: "1;3" },
    { type: "FINAL", pos: 24, raw: "H" },
    { type: "TEXT", pos: 25, raw: "world" },
    { type: "INTRODUCER", pos: 30, raw: "\u001b[", code: "\x9b" },
    { type: "FINAL", pos: 32, raw: "u" },
    { type: "INTRODUCER", pos: 33, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 35, raw: "13" },
    { type: "FINAL", pos: 37, raw: "T" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b[3A\x1b[4D\x1b[shello\x1b[J\x1b[1;3Hworld\x1b[u\x1b[13T`), [
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
  ]);
});

test("complex mixed content", () => {
  assert.deepEqual(tokenize("Hello\x1b[31mworld\x1b[39m!\x1b[1mBold\x1b[0m\x1b[42mGreen BG\x1b[49m."), [
    { type: "TEXT", pos: 0, raw: "Hello" },
    { type: "INTRODUCER", pos: 5, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 7, raw: "31" },
    { type: "FINAL", pos: 9, raw: "m" },
    { type: "TEXT", pos: 10, raw: "world" },
    { type: "INTRODUCER", pos: 15, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 17, raw: "39" },
    { type: "FINAL", pos: 19, raw: "m" },
    { type: "TEXT", pos: 20, raw: "!" },
    { type: "INTRODUCER", pos: 21, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 23, raw: "1" },
    { type: "FINAL", pos: 24, raw: "m" },
    { type: "TEXT", pos: 25, raw: "Bold" },
    { type: "INTRODUCER", pos: 29, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 31, raw: "0" },
    { type: "FINAL", pos: 32, raw: "m" },
    { type: "INTRODUCER", pos: 33, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 35, raw: "42" },
    { type: "FINAL", pos: 37, raw: "m" },
    { type: "TEXT", pos: 38, raw: "Green BG" },
    { type: "INTRODUCER", pos: 46, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 48, raw: "49" },
    { type: "FINAL", pos: 50, raw: "m" },
    { type: "TEXT", pos: 51, raw: "." },
  ]);

  assert.deepEqual(
    tokenizeEscaped(String.raw`Hello\x1b[31mworld\x1b[39m!\x1b[1mBold\x1b[0m\x1b[42mGreen BG\x1b[49m.`),
    [
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
    ]
  );
});

test("text styling sequences", () => {
  assert.deepEqual(tokenize("\x1b[1mBold\x1b[22m\x1b[3mItalic\x1b[23m\x1b[4mUnderline\x1b[24m\x1b[9mStrike\x1b[29m"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "1" },
    { type: "FINAL", pos: 3, raw: "m" },
    { type: "TEXT", pos: 4, raw: "Bold" },
    { type: "INTRODUCER", pos: 8, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 10, raw: "22" },
    { type: "FINAL", pos: 12, raw: "m" },
    { type: "INTRODUCER", pos: 13, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 15, raw: "3" },
    { type: "FINAL", pos: 16, raw: "m" },
    { type: "TEXT", pos: 17, raw: "Italic" },
    { type: "INTRODUCER", pos: 23, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 25, raw: "23" },
    { type: "FINAL", pos: 27, raw: "m" },
    { type: "INTRODUCER", pos: 28, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 30, raw: "4" },
    { type: "FINAL", pos: 31, raw: "m" },
    { type: "TEXT", pos: 32, raw: "Underline" },
    { type: "INTRODUCER", pos: 41, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 43, raw: "24" },
    { type: "FINAL", pos: 45, raw: "m" },
    { type: "INTRODUCER", pos: 46, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 48, raw: "9" },
    { type: "FINAL", pos: 49, raw: "m" },
    { type: "TEXT", pos: 50, raw: "Strike" },
    { type: "INTRODUCER", pos: 56, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 58, raw: "29" },
    { type: "FINAL", pos: 60, raw: "m" },
  ]);

  assert.deepEqual(
    tokenizeEscaped(String.raw`\x1b[1mBold\x1b[22m\x1b[3mItalic\x1b[23m\x1b[4mUnderline\x1b[24m\x1b[9mStrike\x1b[29m`),
    [
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
    ]
  );
});

test("various command sequences", () => {
  assert.deepEqual(tokenize("\x1b[2J\x1b[H\x1b[?25l\x1b[1;1H\x1b[K\x1b[6n\x1b[20l"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "2" },
    { type: "FINAL", pos: 3, raw: "J" },
    { type: "INTRODUCER", pos: 4, raw: "\u001b[", code: "\x9b" },
    { type: "FINAL", pos: 6, raw: "H" },
    { type: "INTRODUCER", pos: 7, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 9, raw: "?25" },
    { type: "FINAL", pos: 12, raw: "l" },
    { type: "INTRODUCER", pos: 13, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 15, raw: "1;1" },
    { type: "FINAL", pos: 18, raw: "H" },
    { type: "INTRODUCER", pos: 19, raw: "\u001b[", code: "\x9b" },
    { type: "FINAL", pos: 21, raw: "K" },
    { type: "INTRODUCER", pos: 22, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 24, raw: "6" },
    { type: "FINAL", pos: 25, raw: "n" },
    { type: "INTRODUCER", pos: 26, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 28, raw: "20" },
    { type: "FINAL", pos: 30, raw: "l" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b[2J\x1b[H\x1b[?25l\x1b[1;1H\x1b[K\x1b[6n\x1b[20l`), [
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
  ]);
});

test("iTerm2 SetUserVar", () => {
  assert.deepEqual(tokenize("\x1b]1337;SetUserVar=foo=YmFy\x07"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b]", code: "\x9d" },
    { type: "DATA", pos: 2, raw: "1337;SetUserVar=foo=YmFy" },
    { type: "FINAL", pos: 26, raw: "\u0007" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b]1337;SetUserVar=foo=YmFy\x07`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 5, raw: "1337;SetUserVar=foo=YmFy" },
    { type: "FINAL", pos: 29, raw: "\\x07" },
  ]);
});

test("very long sequences", () => {
  const longParams = Array(50).fill("1").join(";");
  assert.deepEqual(tokenize(`\x1b[${longParams}m`), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    {
      type: "DATA",
      pos: 2,
      raw: "1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1",
    },
    { type: "FINAL", pos: 101, raw: "m" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b[${longParams}m`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    {
      type: "DATA",
      pos: 5,
      raw: "1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1",
    },
    { type: "FINAL", pos: 104, raw: "m" },
  ]);
});

test("sequences with no parameters", () => {
  assert.deepEqual(tokenize("\x1b[H"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "FINAL", pos: 2, raw: "H" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b[H`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "FINAL", pos: 5, raw: "H" },
  ]);
});

test("nested-like sequences", () => {
  assert.deepEqual(tokenize("\x1b[38;5;196m"), [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "38;5;196" },
    { type: "FINAL", pos: 10, raw: "m" },
  ]);

  assert.deepEqual(tokenizeEscaped(String.raw`\x1b[38;5;196m`), [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "38;5;196" },
    { type: "FINAL", pos: 13, raw: "m" },
  ]);
});
