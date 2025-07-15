import { test } from "node:test";
import assert from "node:assert/strict";
import { parseDCS } from "../src/parsers/dcs.ts";
import type { TOKEN } from "../src/types.ts";

test("parseDCS simple sequence", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\eP", code: "DCS" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: "0;1|name" }];
  const final: TOKEN = { type: "FINAL", pos: 12, raw: "\\e\\\\" };
  assert.deepEqual(parseDCS(introducer, dataTokens, final), {
    type: "DCS",
    pos: 0,
    raw: "\\eP0;1|name\\e\\\\",
    command: "",
    params: ["0;1|name"],
  });
});

test("parseDCS with missing parameters", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\eP", code: "DCS" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: "$q;" }];
  const final: TOKEN = { type: "FINAL", pos: 7, raw: "\\e\\\\" };
  assert.deepEqual(parseDCS(introducer, dataTokens, final), {
    type: "DCS",
    pos: 0,
    raw: "\\eP$q;\\e\\\\",
    command: "$q",
    params: ["-1", "-1"],
  });
});

test("parseDCS with known pattern", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\eP", code: "DCS" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: "$qm" }];
  const final: TOKEN = { type: "FINAL", pos: 7, raw: "\\e\\\\" };
  assert.deepEqual(parseDCS(introducer, dataTokens, final), {
    type: "DCS",
    pos: 0,
    raw: "\\eP$qm\\e\\\\",
    command: "$q",
    params: ["m"],
  });
});

test("parseDCS empty data", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\eP", code: "DCS" };
  const dataTokens: TOKEN[] = [];
  const final: TOKEN = { type: "FINAL", pos: 3, raw: "\\e\\\\" };
  assert.deepEqual(parseDCS(introducer, dataTokens, final), {
    type: "DCS",
    pos: 0,
    raw: "\\eP\\e\\\\",
    command: "",
    params: [],
  });
});

test("parseDCS unknown pattern", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\eP", code: "DCS" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: "unknown" }];
  const final: TOKEN = { type: "FINAL", pos: 10, raw: "\\e\\\\" };
  assert.deepEqual(parseDCS(introducer, dataTokens, final), {
    type: "DCS",
    pos: 0,
    raw: "\\ePunknown\\e\\\\",
    command: "",
    params: ["unknown"],
  });
});
