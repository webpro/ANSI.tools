import { test } from "node:test";
import assert from "node:assert/strict";
import { parseDEC } from "../src/parsers/dec.ts";
import type { TOKEN } from "../src/types.ts";

test("parseDEC basic sequence", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[?", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 4, raw: "25" }];
  const final: TOKEN = { type: "FINAL", pos: 6, raw: "h" };
  assert.deepEqual(parseDEC(introducer, dataTokens, final), {
    type: "DEC",
    pos: 0,
    raw: "\\e[?25h",
    command: "h",
    params: ["25"],
  });
});

test("parseDEC with missing parameters", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[?", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 4, raw: ";" }];
  const final: TOKEN = { type: "FINAL", pos: 5, raw: "h" };
  assert.deepEqual(parseDEC(introducer, dataTokens, final), {
    type: "DEC",
    pos: 0,
    raw: "\\e[?;h",
    command: "h",
    params: ["-1", "-1"],
  });
});

test("parseDEC with intermediate bytes", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[?", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 4, raw: "1$" }];
  const final: TOKEN = { type: "FINAL", pos: 6, raw: "p" };
  assert.deepEqual(parseDEC(introducer, dataTokens, final), {
    type: "DEC",
    pos: 0,
    raw: "\\e[?1$p",
    command: "$p",
    params: ["1"],
  });
});

test("parseDEC multiple parameters with intermediates", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[?", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 4, raw: "1;2$" }];
  const final: TOKEN = { type: "FINAL", pos: 8, raw: "p" };
  assert.deepEqual(parseDEC(introducer, dataTokens, final), {
    type: "DEC",
    pos: 0,
    raw: "\\e[?1;2$p",
    command: "$p",
    params: ["1", "2"],
  });
});

test("parseDEC with colon in parameters", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[?", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 4, raw: "1:2" }];
  const final: TOKEN = { type: "FINAL", pos: 8, raw: "h" };
  assert.deepEqual(parseDEC(introducer, dataTokens, final), {
    type: "DEC",
    pos: 0,
    raw: "\\e[?1:2h",
    command: "h",
    params: ["1:2"],
  });
});

test("parseDEC with intermediates and colons", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[?", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 4, raw: "1:2$" }];
  const final: TOKEN = { type: "FINAL", pos: 9, raw: "p" };
  assert.deepEqual(parseDEC(introducer, dataTokens, final), {
    type: "DEC",
    pos: 0,
    raw: "\\e[?1:2$p",
    command: "$p",
    params: ["1:2"],
  });
});
