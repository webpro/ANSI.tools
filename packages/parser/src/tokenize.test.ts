import assert from "node:assert/strict";
import { test } from "node:test";
import { tokenize } from "./tokenize.ts";

test("unescaped (ESC)", () => {
  const input = "\x1b[2q";
  const tokens = tokenize(input);
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\x1b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "2" },
    { type: "FINAL", pos: 3, raw: "q" },
  ]);
});

test("unescaped (ESC/2)", () => {
  const input = "\u001b[2q";
  const tokens = tokenize(input);
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\u001b[", code: "\x9b" },
    { type: "DATA", pos: 2, raw: "2" },
    { type: "FINAL", pos: 3, raw: "q" },
  ]);
});

test("unescaped (CSI)", () => {
  const input = "\u009b32mGreen text\u009b0m.";
  const tokens = tokenize(input);
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\u009b", code: "\x9b" },
    { type: "DATA", pos: 1, raw: "32" },
    { type: "FINAL", pos: 3, raw: "m" },
    { type: "TEXT", pos: 4, raw: "Green text" },
    { type: "INTRODUCER", pos: 14, raw: "\u009b", code: "\x9b" },
    { type: "DATA", pos: 15, raw: "0" },
    { type: "FINAL", pos: 16, raw: "m" },
    { type: "TEXT", pos: 17, raw: "." },
  ]);
});

test("unescaped (BEL)", () => {
  const input = "\x1b]0;title\x07";
  const tokens = tokenize(input);
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\x1b]", code: "\x9d" },
    { type: "DATA", pos: 2, raw: "0;title" },
    { type: "FINAL", pos: 9, raw: "\x07" },
  ]);
});

test("unescaped (ST - String Terminator)", () => {
  const input = "\x1b]0;title\x9c";
  const tokens = tokenize(input);
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\x1b]", code: "\x9d" },
    { type: "DATA", pos: 2, raw: "0;title" },
    { type: "FINAL", pos: 9, raw: "\x9c" },
  ]);
});

test("unescaped (OSC - Operating System Command)", () => {
  const input = "\x9d0;title\x07";
  const tokens = tokenize(input);
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\x9d", code: "\x9d" },
    { type: "DATA", pos: 1, raw: "0;title" },
    { type: "FINAL", pos: 8, raw: "\x07" },
  ]);
});

test("unescaped (DCS - Device Control String)", () => {
  const input = "\x900;1|data\x9c";
  const tokens = tokenize(input);
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\x90", code: "\x90" },
    { type: "DATA", pos: 1, raw: "0;1|data" },
    { type: "FINAL", pos: 9, raw: "\x9c" },
  ]);
});

test("unescaped (APC - Application Program Command)", () => {
  const input = "\x9fapp data\x9c";
  const tokens = tokenize(input);
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\x9f", code: "\x9f" },
    { type: "DATA", pos: 1, raw: "app data" },
    { type: "FINAL", pos: 9, raw: "\x9c" },
  ]);
});

test("unescaped (PM - Privacy Message)", () => {
  const input = "\x9eprivacy data\x9c";
  const tokens = tokenize(input);
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\x9e", code: "\x9e" },
    { type: "DATA", pos: 1, raw: "privacy data" },
    { type: "FINAL", pos: 13, raw: "\x9c" },
  ]);
});

test("unescaped (SOS - Start of String)", () => {
  const input = "\x98string data\x9c";
  const tokens = tokenize(input);
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\x98", code: "\x98" },
    { type: "DATA", pos: 1, raw: "string data" },
    { type: "FINAL", pos: 12, raw: "\x9c" },
  ]);
});

test("unescaped (ESC with backslash terminator)", () => {
  const input = "\x1b_payload\x1b\\";
  const tokens = tokenize(input);
  assert.deepEqual(tokens, [
    { type: "INTRODUCER", pos: 0, raw: "\x1b_", code: "_" },
    { type: "DATA", pos: 2, raw: "payload" },
    { type: "FINAL", pos: 9, raw: "\x1b\\" },
  ]);
});
