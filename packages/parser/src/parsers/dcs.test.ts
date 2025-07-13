import { test } from "node:test";
import assert from "node:assert/strict";
import { parseDCS } from "./dcs.ts";
import { CODE_TYPES } from "../constants.ts";

test("parseDCS simple sequence", () => {
  const result = parseDCS(0, "\\eP0;1|name\\e\\\\", "0;1|name");
  assert.deepEqual(result, {
    type: CODE_TYPES.DCS,
    pos: 0,
    raw: "\\eP0;1|name\\e\\\\",
    params: ["0;1|name"],
    command: "",
  });
});

test("parseDCS with missing parameters", () => {
  const result = parseDCS(0, "\\eP$q;\\e\\\\", "$q;");
  assert.deepEqual(result, {
    type: CODE_TYPES.DCS,
    pos: 0,
    raw: "\\eP$q;\\e\\\\",
    params: ["-1", "-1"],
    command: "$q",
  });
});

test("parseDCS with known pattern", () => {
  const result = parseDCS(0, "\\eP$qm\\e\\\\", "$qm");
  assert.deepEqual(result, { type: CODE_TYPES.DCS, pos: 0, raw: "\\eP$qm\\e\\\\", params: ["m"], command: "$q" });
});

test("parseDCS empty data", () => {
  const result = parseDCS(0, "\\eP\\e\\\\", "");
  assert.deepEqual(result, { type: CODE_TYPES.DCS, pos: 0, raw: "\\eP\\e\\\\", command: "", params: [] });
});

test("parseDCS unknown pattern", () => {
  const result = parseDCS(0, "\\ePunknown\\e\\\\", "unknown");
  assert.deepEqual(result, {
    type: CODE_TYPES.DCS,
    pos: 0,
    raw: "\\ePunknown\\e\\\\",
    command: "",
    params: ["unknown"],
  });
});
