import { assert as testAssertions } from "node:test";
import assert from "node:assert/strict";
import type { TOKEN } from "../src/types.ts";
import { tokenize } from "../src/tokenize.ts";
import { tokenize as tokenizeEscaped } from "../src/tokenize.escaped.ts";

export function unescapeInput(text: string) {
  return text
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/(\\u001b|\\033|\\e)/gi, "\u001b")
    .replace(/\\u009b/gi, "\u009b")
    .replace(/(\\u0007|\\a)/gi, "\u0007")
    .replace(/\\\\/g, "\\")
    .replace(/\\r/g, "\r")
    .replace(/\\n/g, "\n");
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
