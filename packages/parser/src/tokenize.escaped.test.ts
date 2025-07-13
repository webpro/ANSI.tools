import assert from "node:assert/strict";
import { test } from "node:test";
import { tokenizer } from "./tokenize.escaped.ts";
import type { TOKEN } from "./types.ts";

test("empty", () => {
  const input = "";
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, []);
});

test("text", () => {
  const input = "Hello, world!";
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [{ type: "TEXT", pos: 0, raw: "Hello, world!" }]);
});

test("CSI", () => {
  const input = String.raw`\x1b[31m`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "31" },
    { type: "FINAL", pos: 7, raw: "m" },
  ]);
});

test("OSC", () => {
  const input = String.raw`\x1b]0;title\x07`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 5, raw: "0;title" },
    { type: "FINAL", pos: 12, raw: "\\x07" },
  ]);
});

test("multiple", () => {
  const input = String.raw`\x1b[31m\x1b]0;title\x07`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "31" },
    { type: "FINAL", pos: 7, raw: "m" },
    { type: "INTRODUCER", pos: 8, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 13, raw: "0;title" },
    { type: "FINAL", pos: 20, raw: "\\x07" },
  ]);
});

test("mixed", () => {
  const input = String.raw`Hello, \x1b[31mworld\x1b]0;title\x07!`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "TEXT", pos: 0, raw: "Hello, " },
    { type: "INTRODUCER", pos: 7, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 12, raw: "31" },
    { type: "FINAL", pos: 14, raw: "m" },
    { type: "TEXT", pos: 15, raw: "world" },
    { type: "INTRODUCER", pos: 20, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 25, raw: "0;title" },
    { type: "FINAL", pos: 32, raw: "\\x07" },
    { type: "TEXT", pos: 36, raw: "!" },
  ]);
});

test("colors (rgb)", () => {
  const input = String.raw`\x1b[38;2;255;255;0mH\x1b[0;1;3;35me\x1b[95ml\x1b[42ml\x1b[0;41mo\x1b[0m`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
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
  ]);
});

test("colors", () => {
  const input = String.raw`\u001b[31mRed\u001b[39m, \u001b[32mgreen\u001b[39m, and \u001b[44mblue background\u001b[49m.`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
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
  ]);
});

test("cursor", () => {
  const input = String.raw`\x1b[3A\x1b[4D\x1b[shello\x1b[J\x1b[1;3Hworld\x1b[u\x1b[13T`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
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

test("mixed", () => {
  const input = String.raw`\x1b[A\r\x1b[K\x1b[1;32mOpened \x1b[1;4;34m%s\x1b[0;1;32m in your browser.\x1b[0m\n\n⭐ → ✨\n\n這裡有一些中文文字。\n\nThe End.`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "FINAL", pos: 5, raw: "A" },
    { type: "TEXT", pos: 6, raw: "\\r" },
    { type: "INTRODUCER", pos: 8, raw: "\\x1b[", code: "\x9b" },
    { type: "FINAL", pos: 13, raw: "K" },
    { type: "INTRODUCER", pos: 14, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 19, raw: "1;32" },
    { type: "FINAL", pos: 23, raw: "m" },
    { type: "TEXT", pos: 24, raw: "Opened " },
    { type: "INTRODUCER", pos: 31, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 36, raw: "1;4;34" },
    { type: "FINAL", pos: 42, raw: "m" },
    { type: "TEXT", pos: 43, raw: "%s" },
    { type: "INTRODUCER", pos: 45, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 50, raw: "0;1;32" },
    { type: "FINAL", pos: 56, raw: "m" },
    { type: "TEXT", pos: 57, raw: " in your browser." },
    { type: "INTRODUCER", pos: 74, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 79, raw: "0" },
    { type: "FINAL", pos: 80, raw: "m" },
    { type: "TEXT", pos: 81, raw: "\\n\\n⭐ → ✨\\n\\n這裡有一些中文文字。\\n\\nThe End." },
  ]);
});

test("styles", () => {
  const input = String.raw`\u001b[1mBold\u001b[22m, \u001b[3mItalic\u001b[23m, \u001b[4mUnderline\u001b[24m, and \u001b[9mStrikethrough\u001b[29m.`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\u001b[", code: "\x9b" },
    { type: "DATA", pos: 7, raw: "1" },
    { type: "FINAL", pos: 8, raw: "m" },
    { type: "TEXT", pos: 9, raw: "Bold" },
    { type: "INTRODUCER", pos: 13, raw: "\\u001b[", code: "\x9b" },
    { type: "DATA", pos: 20, raw: "22" },
    { type: "FINAL", pos: 22, raw: "m" },
    { type: "TEXT", pos: 23, raw: ", " },
    { type: "INTRODUCER", pos: 25, raw: "\\u001b[", code: "\x9b" },
    { type: "DATA", pos: 32, raw: "3" },
    { type: "FINAL", pos: 33, raw: "m" },
    { type: "TEXT", pos: 34, raw: "Italic" },
    { type: "INTRODUCER", pos: 40, raw: "\\u001b[", code: "\x9b" },
    { type: "DATA", pos: 47, raw: "23" },
    { type: "FINAL", pos: 49, raw: "m" },
    { type: "TEXT", pos: 50, raw: ", " },
    { type: "INTRODUCER", pos: 52, raw: "\\u001b[", code: "\x9b" },
    { type: "DATA", pos: 59, raw: "4" },
    { type: "FINAL", pos: 60, raw: "m" },
    { type: "TEXT", pos: 61, raw: "Underline" },
    { type: "INTRODUCER", pos: 70, raw: "\\u001b[", code: "\x9b" },
    { type: "DATA", pos: 77, raw: "24" },
    { type: "FINAL", pos: 79, raw: "m" },
    { type: "TEXT", pos: 80, raw: ", and " },
    { type: "INTRODUCER", pos: 86, raw: "\\u001b[", code: "\x9b" },
    { type: "DATA", pos: 93, raw: "9" },
    { type: "FINAL", pos: 94, raw: "m" },
    { type: "TEXT", pos: 95, raw: "Strikethrough" },
    { type: "INTRODUCER", pos: 108, raw: "\\u001b[", code: "\x9b" },
    { type: "DATA", pos: 115, raw: "29" },
    { type: "FINAL", pos: 117, raw: "m" },
    { type: "TEXT", pos: 118, raw: "." },
  ]);
});

test("commands", () => {
  const input = String.raw`\u001bc\u001b[2J\u001b[3J\u001b[?25l\u001b]0;Set Title\u0007An example of terminal commands.`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\u001b", code: "\x1b" },
    { type: "FINAL", pos: 6, raw: "c" },
    { type: "INTRODUCER", pos: 7, raw: "\\u001b[", code: "\x9b" },
    { type: "DATA", pos: 14, raw: "2" },
    { type: "FINAL", pos: 15, raw: "J" },
    { type: "INTRODUCER", pos: 16, raw: "\\u001b[", code: "\x9b" },
    { type: "DATA", pos: 23, raw: "3" },
    { type: "FINAL", pos: 24, raw: "J" },
    { type: "INTRODUCER", pos: 25, raw: "\\u001b[", code: "\x9b" },
    { type: "DATA", pos: 32, raw: "?25" },
    { type: "FINAL", pos: 35, raw: "l" },
    { type: "INTRODUCER", pos: 36, raw: "\\u001b]", code: "\x9d" },
    { type: "DATA", pos: 43, raw: "0;Set Title" },
    { type: "FINAL", pos: 54, raw: "\\u0007" },
    { type: "TEXT", pos: 60, raw: "An example of terminal commands." },
  ]);
});

test("8-bit", () => {
  const input = String.raw`\u009b32mGreen text\u009b0m.`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
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

test("OSC terminator", () => {
  const input = String.raw`\x1b]0;title\x1b\\`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 5, raw: "0;title" },
    { type: "FINAL", pos: 12, raw: "\\x1b\\\\" },
  ]);
});

test("Set G1 Charset to UK", () => {
  const input = String.raw`\x1b(Ab`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b(", code: "\x1b", intermediate: "(" },
    { type: "FINAL", pos: 5, raw: "A" },
    { type: "TEXT", pos: 6, raw: "b" },
  ]);
});

test("Set G1 Charset to UK (no intermediate)", () => {
  const input = String.raw`\x1b)B`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b)", code: "\x1b", intermediate: ")" },
    { type: "FINAL", pos: 5, raw: "B" },
  ]);
});

test("Select UTF-8 character set", () => {
  const input = String.raw`\x1b%G`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b%", code: "\x1b", intermediate: "%" },
    { type: "FINAL", pos: 5, raw: "G" },
  ]);
});

test("DEC Private Mode - Hide Cursor", () => {
  const input = String.raw`\x1b[?25l`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b[", code: "\x9b" },
    { type: "DATA", pos: 5, raw: "?25" },
    { type: "FINAL", pos: 8, raw: "l" },
  ]);
});

test("Simple ESC", () => {
  const input = String.raw`\x1bc`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b", code: "\x1b" },
    { type: "FINAL", pos: 4, raw: "c" },
  ]);
});

test("iTerm2 SetUserVar", () => {
  const input = String.raw`\x1b]1337;SetUserVar=foo=YmFy\x07`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 5, raw: "1337;SetUserVar=foo=YmFy" },
    { type: "FINAL", pos: 29, raw: "\\x07" },
  ]);
});

test("DCS with \\e\\\\ terminator", () => {
  const input = String.raw`\x1bP0;1|name\e\\`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\x1bP", code: "P" },
    { type: "DATA", pos: 5, raw: "0;1|name" },
    { type: "FINAL", pos: 13, raw: "\\e\\\\" },
  ]);
});

test("APC with \\e\\\\ terminator", () => {
  const input = String.raw`\x1b_some payload\e\\`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b_", code: "_" },
    { type: "DATA", pos: 5, raw: "some payload" },
    { type: "FINAL", pos: 17, raw: "\\e\\\\" },
  ]);
});

test("PM with \\e\\\\ terminator", () => {
  const input = String.raw`\x1b^privacy data\e\\`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b^", code: "^" },
    { type: "DATA", pos: 5, raw: "privacy data" },
    { type: "FINAL", pos: 17, raw: "\\e\\\\" },
  ]);
});

test("SOS with \\e\\\\ terminator", () => {
  const input = String.raw`\x1bXstring data\e\\`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\x1bX", code: "X" },
    { type: "DATA", pos: 5, raw: "string data" },
    { type: "FINAL", pos: 16, raw: "\\e\\\\" },
  ]);
});

test("DCS with \\x1b\\\\ terminator", () => {
  const input = String.raw`\x1bP0;1|name\x1b\\`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\x1bP", code: "P" },
    { type: "DATA", pos: 5, raw: "0;1|name" },
    { type: "FINAL", pos: 13, raw: "\\x1b\\\\" },
  ]);
});

test("APC with \\x1b\\\\ terminator", () => {
  const input = String.raw`\x1b_app data\x1b\\`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b_", code: "_" },
    { type: "DATA", pos: 5, raw: "app data" },
    { type: "FINAL", pos: 13, raw: "\\x1b\\\\" },
  ]);
});

test("OSC with \\e\\\\ terminator", () => {
  const input = String.raw`\x1b]0;window title\e\\`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 5, raw: "0;window title" },
    { type: "FINAL", pos: 19, raw: "\\e\\\\" },
  ]);
});

test("Mixed string sequences with different terminators", () => {
  const input = String.raw`\x1b_app\e\\\x1bP0|data\x1b\\\x1b]0;title\x07`;
  const tokens: TOKEN[] = [...tokenizer(input)];
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b_", code: "_" },
    { type: "DATA", pos: 5, raw: "app" },
    { type: "FINAL", pos: 8, raw: "\\e\\\\" },
    { type: "INTRODUCER", pos: 12, raw: "\\x1bP", code: "P" },
    { type: "DATA", pos: 17, raw: "0|data" },
    { type: "FINAL", pos: 23, raw: "\\x1b\\\\" },
    { type: "INTRODUCER", pos: 29, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 34, raw: "0;title" },
    { type: "FINAL", pos: 41, raw: "\\x07" },
  ]);
});
