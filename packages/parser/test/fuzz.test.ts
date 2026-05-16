import assert from "node:assert/strict";
import { test } from "node:test";
import { parse } from "../src/parse.ts";
import { parse as parseEscaped } from "../src/parse.escaped.ts";
import type { CODE } from "../src/types.ts";

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rawJoin(codes: CODE[]): string {
  let s = "";
  for (const c of codes) s += c.raw;
  return s;
}

// Bias toward bytes that exercise sequence paths.
const ALPHABET = [
  "\x1b",
  "\x9b",
  "\x9d",
  "\x90",
  "\x9c",
  "\x07",
  "\x18",
  "\x1a",
  "[",
  "]",
  "P",
  "_",
  "^",
  "X",
  "?",
  ">",
  "<",
  "=",
  ";",
  ":",
  "$",
  "q",
  "m",
  "0",
  "1",
  "9",
  "A",
  "z",
  "\\",
  " ",
  "\n",
  "é",
  "🌈",
];

test("fuzz: biased alphabet, parse never throws and is lossless", () => {
  const rng = mulberry32(0x1234abcd);
  for (let n = 0; n < 5000; n++) {
    const len = (rng() * 40) | 0;
    let input = "";
    for (let k = 0; k < len; k++) input += ALPHABET[(rng() * ALPHABET.length) | 0];
    let codes: CODE[];
    try {
      codes = parse(input);
    } catch (e) {
      assert.fail(`parse threw on ${JSON.stringify(input)}: ${(e as Error).message}`);
    }
    assert.equal(rawJoin(codes), input, `not lossless for ${JSON.stringify(input)}`);
  }
});

test("fuzz: arbitrary code points, parse never throws and is lossless", () => {
  const rng = mulberry32(0xfeed5eed);
  for (let n = 0; n < 3000; n++) {
    const len = (rng() * 64) | 0;
    let input = "";
    for (let k = 0; k < len; k++) input += String.fromCharCode((rng() * 256) | 0);
    let codes: CODE[];
    try {
      codes = parse(input);
    } catch (e) {
      assert.fail(`parse threw on ${JSON.stringify(input)}: ${(e as Error).message}`);
    }
    assert.equal(rawJoin(codes), input, `not lossless for ${JSON.stringify(input)}`);
  }
});

test("fuzz: escaped parser, never throws and is lossless", () => {
  const rng = mulberry32(0x0badf00d);
  const escAlphabet = ["\\", "x", "u", "e", "0", "3", "1", "b", "9", "a", "[", "]", ";", "m", "P", "t", " "];
  for (let n = 0; n < 5000; n++) {
    const len = (rng() * 40) | 0;
    let input = "";
    for (let k = 0; k < len; k++) input += escAlphabet[(rng() * escAlphabet.length) | 0];
    let codes: CODE[];
    try {
      codes = parseEscaped(input);
    } catch (e) {
      assert.fail(`parseEscaped threw on ${JSON.stringify(input)}: ${(e as Error).message}`);
    }
    assert.equal(rawJoin(codes), input, `escaped not lossless for ${JSON.stringify(input)}`);
  }
});
