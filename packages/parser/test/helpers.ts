import { assert as testAssertions } from "node:test";
import assert from "node:assert/strict";
import type { TOKEN, CODE } from "../src/types.ts";
import { tokenize } from "../src/tokenize.ts";
import { tokenize as tokenizeEscaped } from "../src/tokenize.escaped.ts";
import { parse } from "../src/parse.ts";
import { parse as parseEscaped } from "../src/parse.escaped.ts";

export function unescapeInput(text: string) {
  return text
    .replace(/(\\u001b|\\x1b|\\033|\\e)/gi, "\u001b")
    .replace(/\\u009b/gi, "\u009b")
    .replace(/(\\u0007|\\a|\\x07)/gi, "\u0007")
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\\\/g, "\\")
    .replace(/\\r/g, "\r")
    .replace(/\\n/g, "\n");
}

export function tokenizeWithFinalizer(input: string): [TOKEN, TOKEN[], TOKEN | undefined] {
  const [introducer, ...rest] = tokenizeEscaped(input);
  return [introducer, rest.slice(0, -1), rest.at(-1)];
}

testAssertions.register("equalTokens", (tokenizeFn, input, expected) => {
  if (tokenizeFn === tokenizeEscaped) {
    assert.deepEqual(tokenizeFn(input), expected);
  } else {
    const actual = tokenizeFn(unescapeInput(input));
    const _actual = actual.map((item: TOKEN) => ({ ...item, pos: undefined }));
    const _expected = expected.map((item: TOKEN) => ({ ...item, pos: undefined, raw: unescapeInput(item.raw) }));
    assert.deepEqual(_actual, _expected);
  }
});

testAssertions.register("equalTokensDual", (input, expected) => {
  assert.deepEqual(tokenizeEscaped(input), expected);

  const actual = tokenize(unescapeInput(input));
  const _actual = actual.map((item: TOKEN) => ({ ...item, pos: undefined }));
  const _expected = expected.map((item: TOKEN) => ({ ...item, pos: undefined, raw: unescapeInput(item.raw) }));
  assert.deepEqual(_actual, _expected);
});

testAssertions.register("equalCodesDual", (input, expected) => {
  assert.deepEqual(parseEscaped(input), expected);

  const actual = parse(unescapeInput(input));
  const _actual = actual.map((item: CODE) => ({ ...item, pos: undefined }));
  const _expected = expected.map((item: CODE) => ({ ...item, pos: undefined, raw: unescapeInput(item.raw) }));
  assert.deepEqual(_actual, _expected);
});
