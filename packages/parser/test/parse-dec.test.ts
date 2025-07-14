import { test } from "node:test";
import assert from "node:assert/strict";
import { parseDEC } from "../src/parsers/dec.ts";

test("parseDEC basic sequence", () => {
  assert.deepEqual(parseDEC(0, "\\e[?25h", "?25", "h"), {
    type: "DEC",
    pos: 0,
    raw: "\\e[?25h",
    command: "h",
    params: ["25"],
  });
});

test("parseDEC with missing parameters", () => {
  assert.deepEqual(parseDEC(0, "\\e[?;h", "?;", "h"), {
    type: "DEC",
    pos: 0,
    raw: "\\e[?;h",
    command: "h",
    params: ["-1", "-1"],
  });
});

test("parseDEC with intermediate bytes", () => {
  assert.deepEqual(parseDEC(0, "\\e[?1$p", "?1$", "p"), {
    type: "DEC",
    pos: 0,
    raw: "\\e[?1$p",
    command: "$p",
    params: ["1"],
  });
});

test("parseDEC multiple parameters with intermediates", () => {
  assert.deepEqual(parseDEC(0, "\\e[?1;2$p", "?1;2$", "p"), {
    type: "DEC",
    pos: 0,
    raw: "\\e[?1;2$p",
    command: "$p",
    params: ["1", "2"],
  });
});
