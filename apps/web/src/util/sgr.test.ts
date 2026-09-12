import { test } from "node:test";
import assert from "node:assert/strict";
import { parse } from "@ansi-tools/parser";
import { parse as parseEscaped } from "@ansi-tools/parser/escaped";
import { extractControlCodes } from "./table.ts";

for (const [body, description] of [
  ["m", "reset"],
  ["0m", "reset"],
  ["4:0m", "no underline"],
  ["4:3m", "curly underline"],
  ["4;3m", "underline, italic"],
  ["38;2;255;105;180m", "fg color: 24-bit rgb(255, 105, 180)"],
  ["1;38;2;255;105;180m", "bold, fg color: 24-bit rgb(255, 105, 180)"],
  ["38:2::255:105:180m", "fg color: 24-bit rgb(255, 105, 180)"],
  ["48:2:0:255:105:18m", "bg color: 24-bit rgb(255, 105, 18)"],
  ["58;2;1;2;3m", "underline color: 24-bit rgb(1, 2, 3)"],
  ["58:2::1:2:3m", "underline color: 24-bit rgb(1, 2, 3)"],
  ["58;5;198m", "underline color: 8-bit rgb cube 502 (#198)"],
  ["38;05;196m", "fg color: 8-bit rgb cube 500 (#196)"],
  ["38:05:196m", "fg color: 8-bit rgb cube 500 (#196)"],
  ["38;02;1;2;3m", "fg color: 24-bit rgb(1, 2, 3)"],
  ["4:03m", "curly underline"],
  ["999999999999999999999m", "unknown SGR parameter: 999999999999999999999"],
  ["38;2;255m", "incomplete fg color"],
  ["999m", "unknown SGR parameter: 999"],
] as const) {
  test(`SGR description ${body}`, () => {
    assert.equal(extractControlCodes(parse(`\x1b[${body}`))[0].description, description);
    assert.equal(extractControlCodes(parseEscaped(`\\x1b[${body}`))[0].description, description);
  });
}
