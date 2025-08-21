import { test } from "node:test";
import type { CODE } from "../src/types.ts";

test("private sequences with parameters", t => {
  const input = String.raw`\x1b[>0;2m\x1b[>1p`;
  const expected: CODE[] = [
    { type: "PRIVATE", pos: 0, raw: "\\x1b[>0;2m", command: ">m", params: ["0", "2"] },
    { type: "PRIVATE", pos: 10, raw: "\\x1b[>1p", command: ">p", params: ["1"] },
  ];
  t.assert.equalCodesDual(input, expected);
});

test("private opener in second param", t => {
  const input = String.raw`\x1b[1;>2m`;
  const expected: CODE[] = [{ type: "PRIVATE", pos: 0, raw: "\\x1b[1;>2m", command: ">m", params: ["1", "2"] }];
  t.assert.equalCodesDual(input, expected);
});

test("private opener in third param", t => {
  const input = String.raw`\x1b[1;2;>3m`;
  const expected: CODE[] = [{ type: "PRIVATE", pos: 0, raw: "\\x1b[1;2;>3m", command: ">m", params: ["1", "2", "3"] }];
  t.assert.equalCodesDual(input, expected);
});

test("multiple private openers", t => {
  const input = String.raw`\x1b[>1;>2;>3m`;
  const expected: CODE[] = [
    { type: "PRIVATE", pos: 0, raw: "\\x1b[>1;>2;>3m", command: ">m", params: ["1", ">2", ">3"] },
  ];
  t.assert.equalCodesDual(input, expected);
});
