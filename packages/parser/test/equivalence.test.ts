import assert from "node:assert/strict";
import { test } from "node:test";
import { parse, parser, parseTokens } from "../src/parse.ts";
import { parse as parseEscaped } from "../src/parse.escaped.ts";
import { tokenize as tokenizeRaw, tokenizer as tokenizerRaw } from "../src/tokenize.ts";
import { tokenize as tokenizeEscaped, tokenizer as tokenizerEscaped } from "../src/tokenize.escaped.ts";
import type { TOKEN } from "../src/types.ts";
import { unescapeInput } from "./helpers.ts";

const SAMPLE = String.raw`text \x1b[1;31mred\x1b[0m \x1b[38;2;255;0;128mrgb\x1b[m \x1b]0;title\x07 \x1b]8;;https://example.com\x1b\\link\x1b]8;;\x07 \x1bPq~data\x1b\\ \x1b_apc\x1b\\ \x1b#3 \x1b(B \x1bM \x9b31m \x9d0;t\x07 plain`;
const RAW_SAMPLE = unescapeInput(SAMPLE);

function arrIter(tokens: TOKEN[]): IterableIterator<TOKEN> {
  return tokens[Symbol.iterator]();
}

function assertEquivalent(input: string, escaped: boolean, label: string) {
  const toGen = escaped ? tokenizerEscaped : tokenizerRaw;
  const toArr = escaped ? tokenizeEscaped : tokenizeRaw;

  const tokensGen = [...toGen(input)];
  const tokensArr = toArr(input);
  assert.deepStrictEqual(tokensGen, tokensArr, `tokenizer != tokenize | ${label} | ${JSON.stringify(input)}`);

  // parser (generator) vs parseTokens (array) on identical token input.
  const codesGen = [...parser(arrIter(tokensArr))];
  const codesArr = parseTokens(tokensArr);
  assert.deepStrictEqual(codesGen, codesArr, `parser != parseTokens | ${label} | ${JSON.stringify(input)}`);

  // Full generator chain vs the array parse() entry point.
  const e2eGen = [...parser(toGen(input))];
  const e2eArr = escaped ? parseEscaped(input) : parse(input);
  assert.deepStrictEqual(e2eGen, e2eArr, `parser(tokenizer()) != parse | ${label} | ${JSON.stringify(input)}`);
}

test("equivalence: full rich sample (raw + escaped)", () => {
  assertEquivalent(SAMPLE, true, "escaped full");
  assertEquivalent(RAW_SAMPLE, false, "raw full");
});

test("equivalence: every prefix (truncation at every offset)", () => {
  for (let i = 0; i <= SAMPLE.length; i++) assertEquivalent(SAMPLE.slice(0, i), true, `escaped prefix ${i}`);
  for (let i = 0; i <= RAW_SAMPLE.length; i++) assertEquivalent(RAW_SAMPLE.slice(0, i), false, `raw prefix ${i}`);
});

test("equivalence: every suffix", () => {
  for (let i = 0; i < SAMPLE.length; i++) assertEquivalent(SAMPLE.slice(i), true, `escaped suffix ${i}`);
  for (let i = 0; i < RAW_SAMPLE.length; i++) assertEquivalent(RAW_SAMPLE.slice(i), false, `raw suffix ${i}`);
});

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fuzz(seed: number, alphabet: string[], maxLen: number, runs: number, escaped: boolean, tag: string) {
  const rng = mulberry32(seed);
  for (let n = 0; n < runs; n++) {
    const len = (rng() * maxLen) | 0;
    let input = "";
    for (let k = 0; k < len; k++) input += alphabet[(rng() * alphabet.length) | 0];
    assertEquivalent(input, escaped, `${tag} #${n}`);
  }
}

const RAW_ALPHABET = [
  "\x1b", "\x9b", "\x9d", "\x90", "\x9c", "\x07", "\x18", "\x1a", "[", "]", "P", "_", "^", "X", "?", ">", "<", "=",
  ";", ":", "$", "q", "m", "0", "1", "9", "A", "z", "\\", " ", "\n", "é", "🌈",
];
const ESC_ALPHABET = ["\\", "x", "u", "e", "0", "3", "1", "b", "9", "a", "[", "]", ";", "m", "P", "t", " ", "\x1b", "\x9b"];

test("equivalence fuzz: biased alphabet (raw)", () => {
  fuzz(0x5eed0001, RAW_ALPHABET, 48, 2000, false, "fuzz raw");
});

test("equivalence fuzz: escaped alphabet", () => {
  fuzz(0x5eed0002, ESC_ALPHABET, 48, 2000, true, "fuzz esc");
});

test("equivalence fuzz: arbitrary code points (raw)", () => {
  const rng = mulberry32(0x5eed0003);
  for (let n = 0; n < 1500; n++) {
    const len = (rng() * 64) | 0;
    let input = "";
    for (let k = 0; k < len; k++) input += String.fromCharCode((rng() * 256) | 0);
    assertEquivalent(input, false, `fuzz cp #${n}`);
  }
});
