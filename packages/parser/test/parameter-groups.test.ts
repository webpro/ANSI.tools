import { test } from "node:test";
import assert from "node:assert/strict";
import { parse } from "../src/index.ts";
import { parse as parseEscaped } from "../src/escaped.ts";

for (const [body, params, parameterGroups] of [
  ["4:3m", ["4", "3"], [["4", "3"]]],
  ["38;2;255;105;180m", ["38", "2", "0", "255", "105", "180"], [["38"], ["2"], ["255"], ["105"], ["180"]]],
  ["38:2::255:105:180m", ["38", "2", "0", "255", "105", "180"], [["38", "2", "", "255", "105", "180"]]],
  [";31m", ["0", "31"], [[""], ["31"]]],
  ["1;0r", ["1", "-1"], [["1"], ["0"]]],
  ["?1:2h", ["1", "2"], [["1", "2"]]],
  [">;2m", ["2"], [[""], ["2"]]],
  ["1>;>m", ["1>"], [["1>"], [""]]],
  ["1>;>2:3m", ["1>", "2", "3"], [["1>"], ["2", "3"]]],
] as const) {
  test(`lossless CSI parameter groups: ${body}`, () => {
    for (const [parseInput, input] of [
      [parse, `\x1b[${body}`],
      [parseEscaped, `\\x1b[${body}`],
    ] as const) {
      const [code] = parseInput(input);
      assert.notEqual(code.type, "TEXT");
      if (code.type === "TEXT") return;
      assert.deepEqual(code.params, params);
      assert.deepEqual(code.parameterGroups, parameterGroups);
      assert.equal(code.raw, input);
    }
  });
}

test("ordinary CSI output retains its shape", () => {
  assert.deepEqual(parse("\x1b[4;3m"), [{ type: "CSI", pos: 0, raw: "\x1b[4;3m", command: "m", params: ["4", "3"] }]);
});
