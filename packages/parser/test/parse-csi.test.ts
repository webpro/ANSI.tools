import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCSI, parsePrivateCSI } from "../src/parsers/csi.ts";

test("parseCSI simple command", () => {
  assert.deepEqual(parseCSI(0, "\\e[31m", "31", "m"), {
    type: "CSI",
    pos: 0,
    raw: "\\e[31m",
    command: "m",
    params: ["31"],
  });
});

test("parseCSI with multiple params", () => {
  assert.deepEqual(parseCSI(0, "\\e[1;31m", "1;31", "m"), {
    type: "CSI",
    pos: 0,
    raw: "\\e[1;31m",
    command: "m",
    params: ["1", "31"],
  });
});

test("parseCSI with missing parameters", () => {
  assert.deepEqual(parseCSI(0, "\\e[;31m", ";31", "m"), {
    type: "CSI",
    pos: 0,
    raw: "\\e[;31m",
    command: "m",
    params: ["-1", "31"],
  });
});

test("parseCSI with trailing semicolon", () => {
  assert.deepEqual(parseCSI(0, "\\e[31;m", "31;", "m"), {
    type: "CSI",
    pos: 0,
    raw: "\\e[31;m",
    command: "m",
    params: ["31", "-1"],
  });
});

test("parseCSI with colon-delimited SGR", () => {
  assert.deepEqual(parseCSI(0, "\\e[38:2:10:20:30m", "38:2:10:20:30", "m"), {
    type: "CSI",
    pos: 0,
    raw: "\\e[38:2:10:20:30m",
    command: "m",
    params: ["38", "2", "10", "20", "30"],
  });
});

test("parseCSI with leading semicolon", () => {
  assert.deepEqual(parseCSI(0, "\\e[;m", ";", "m"), {
    type: "CSI",
    pos: 0,
    raw: "\\e[;m",
    command: "m",
    params: ["-1", "-1"],
  });
});

test("parseCSI with subparameters", () => {
  assert.deepEqual(parseCSI(0, "\\e[38;2;255;128;0m", "38;2;255;128;0", "m"), {
    type: "CSI",
    pos: 0,
    raw: "\\e[38;2;255;128;0m",
    command: "m",
    params: ["38", "2", "255", "128", "0"],
  });
});

test("parseCSI no data", () => {
  assert.deepEqual(parseCSI(0, "\\e[m", "", "m"), { type: "CSI", pos: 0, raw: "\\e[m", command: "m", params: [] });
});

test("parsePrivateCSI with < introducer", () => {
  assert.deepEqual(parsePrivateCSI(0, "\\e[<31m", "<31", "m"), {
    type: "PRIVATE",
    pos: 0,
    raw: "\\e[<31m",
    command: "<m",
    params: ["31"],
  });
});

test("parsePrivateCSI with > introducer", () => {
  assert.deepEqual(parsePrivateCSI(0, "\\e[>c", ">", "c"), {
    type: "PRIVATE",
    pos: 0,
    raw: "\\e[>c",
    command: ">c",
    params: [],
  });
});

test("parsePrivateCSI with = introducer", () => {
  assert.deepEqual(parsePrivateCSI(0, "\\e[=1;2c", "=1;2", "c"), {
    type: "PRIVATE",
    pos: 0,
    raw: "\\e[=1;2c",
    command: "=c",
    params: ["1", "2"],
  });
});

test("parsePrivateCSI with colon in parameters", () => {
  assert.deepEqual(parsePrivateCSI(0, "\\e[<1:2m", "<1:2", "m"), {
    type: "PRIVATE",
    pos: 0,
    raw: "\\e[<1:2m",
    command: "<m",
    params: ["1:2"],
  });
});
