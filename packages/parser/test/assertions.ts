import { assert as testAssertions } from "node:test";
import assert from "node:assert/strict";
import type { TOKEN, CODE } from "../src/types.ts";
import { tokenize } from "../src/tokenize.ts";
import { tokenize as tokenizeEscaped } from "../src/tokenize.escaped.ts";
import { parse } from "../src/parse.ts";
import { parse as parseEscaped } from "../src/parse.escaped.ts";
import { unescapeInput } from "./helpers.ts";

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
