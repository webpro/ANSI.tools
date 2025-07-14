import { test } from "node:test";
import assert from "node:assert/strict";
import { parseDCS } from "../src/parsers/dcs.ts";

test("parseDCS simple sequence", () => {
  assert.deepEqual(parseDCS(0, "\\eP0;1|name\\e\\\\", "0;1|name"), {
    type: "DCS",
    pos: 0,
    raw: "\\eP0;1|name\\e\\\\",
    command: "",
    params: ["0;1|name"],
  });
});

test("parseDCS with missing parameters", () => {
  assert.deepEqual(parseDCS(0, "\\eP$q;\\e\\\\", "$q;"), {
    type: "DCS",
    pos: 0,
    raw: "\\eP$q;\\e\\\\",
    command: "$q",
    params: ["-1", "-1"],
  });
});

test("parseDCS with known pattern", () => {
  assert.deepEqual(parseDCS(0, "\\eP$qm\\e\\\\", "$qm"), {
    type: "DCS",
    pos: 0,
    raw: "\\eP$qm\\e\\\\",
    command: "$q",
    params: ["m"],
  });
});

test("parseDCS empty data", () => {
  assert.deepEqual(parseDCS(0, "\\eP\\e\\\\", ""), {
    type: "DCS",
    pos: 0,
    raw: "\\eP\\e\\\\",
    command: "",
    params: [],
  });
});

test("parseDCS unknown pattern", () => {
  assert.deepEqual(parseDCS(0, "\\ePunknown\\e\\\\", "unknown"), {
    type: "DCS",
    pos: 0,
    raw: "\\ePunknown\\e\\\\",
    command: "",
    params: ["unknown"],
  });
});
