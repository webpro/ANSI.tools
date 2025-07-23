import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCSI } from "../src/parsers/csi.ts";
import { tokenizeWithFinalizer } from "./helpers.ts";

test("parseCSI basic sequence", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[?25h`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "DEC",
    pos: 0,
    raw: "\\e[?25h",
    command: "h",
    params: ["25"],
  });
});

test("parseCSI with missing parameters", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[?;h`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "DEC",
    pos: 0,
    raw: "\\e[?;h",
    command: "h",
    params: ["0"],
  });
});

test("parseCSI with intermediate bytes", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[?1$p`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "DEC",
    pos: 0,
    raw: "\\e[?1$p",
    command: "$p",
    params: ["1"],
  });
});

test("parseCSI multiple parameters with intermediates", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[?1;2$p`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "DEC",
    pos: 0,
    raw: "\\e[?1;2$p",
    command: "$p",
    params: ["1", "2"],
  });
});

test("parseCSI with colon in parameters", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[?1:2h`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "DEC",
    pos: 0,
    raw: "\\e[?1:2h",
    command: "h",
    params: ["1", "2"],
  });
});

test("parseCSI with intermediates and colons", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[?1:2$p`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "DEC",
    pos: 0,
    raw: "\\e[?1:2$p",
    command: "$p",
    params: ["1", "2"],
  });
});
