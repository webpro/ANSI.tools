import assert from "node:assert/strict";
import { test } from "node:test";
import { parse } from "@ansi-tools/parser/escaped";
import { createRowsFromCodes } from "./table.ts";

test("CSI examples use parameter separators without description punctuation", () => {
  const rows = createRowsFromCodes();
  for (const [mnemonic, example, command, params] of [
    ["CUP", "\\u001b[1;1H", "H", ["1", "1"]],
    ["DECSTBM", "\\u001b[1;24r", "r", ["1", "24"]],
  ] as const) {
    const actual = rows.find(row => row.mnemonic === mnemonic)?.example;
    assert.equal(actual, example);
    assert.deepEqual(parse(actual), [{ type: "CSI", raw: example, pos: 0, command, params }]);
  }
});

test("generated DCS queries parse as their advertised commands", () => {
  const rows = createRowsFromCodes();
  for (const [command, params] of [
    ["$q", ["m"]],
    ["+q", ["436f"]],
  ] as const) {
    const example = rows.find(row => row.type === "DCS" && row.sort === command)?.example;
    assert.ok(example);
    const codes = parse(example);
    assert.equal(codes.length, 1);
    assert.equal(codes[0].type, "DCS");
    assert.equal(codes[0].command, command);
    assert.deepEqual(codes[0].params, params);
  }
});
