import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCSI, parsePrivateCSI } from "./csi.ts";
import { CODE_TYPES } from "../constants.ts";

test("parseCSI simple command", () => {
  const result = parseCSI(0, "\\e[31m", "31", "m");
  assert.deepEqual(result, { type: CODE_TYPES.CSI, pos: 0, raw: "\\e[31m", params: ["31"], command: "m" });
});

test("parseCSI with multiple params", () => {
  const result = parseCSI(0, "\\e[1;31m", "1;31", "m");
  assert.deepEqual(result, { type: CODE_TYPES.CSI, pos: 0, raw: "\\e[1;31m", params: ["1", "31"], command: "m" });
});

test("parseCSI with missing parameters", () => {
  const result = parseCSI(0, "\\e[;31m", ";31", "m");
  assert.deepEqual(result, { type: CODE_TYPES.CSI, pos: 0, raw: "\\e[;31m", params: ["-1", "31"], command: "m" });
});

test("parseCSI with trailing semicolon", () => {
  const result = parseCSI(0, "\\e[31;m", "31;", "m");
  assert.deepEqual(result, { type: CODE_TYPES.CSI, pos: 0, raw: "\\e[31;m", params: ["31", "-1"], command: "m" });
});

test("parseCSI with leading semicolon", () => {
  const result = parseCSI(0, "\\e[;m", ";", "m");
  assert.deepEqual(result, { type: CODE_TYPES.CSI, pos: 0, raw: "\\e[;m", params: ["-1", "-1"], command: "m" });
});

test("parseCSI no data", () => {
  const result = parseCSI(0, "\\e[m", "", "m");
  assert.deepEqual(result, { type: CODE_TYPES.CSI, pos: 0, raw: "\\e[m", params: [], command: "m" });
});

test("parsePrivateCSI with < introducer", () => {
  const result = parsePrivateCSI(0, "\\e[<31m", "<31", "m");
  assert.deepEqual(result, { type: CODE_TYPES.PRIVATE, pos: 0, raw: "\\e[<31m", params: ["31"], command: "<m" });
});

test("parsePrivateCSI with > introducer", () => {
  const result = parsePrivateCSI(0, "\\e[>c", ">", "c");
  assert.deepEqual(result, { type: CODE_TYPES.PRIVATE, pos: 0, raw: "\\e[>c", params: [], command: ">c" });
});

test("parsePrivateCSI with = introducer", () => {
  const result = parsePrivateCSI(0, "\\e[=1;2c", "=1;2", "c");
  assert.deepEqual(result, {
    type: CODE_TYPES.PRIVATE,
    pos: 0,
    raw: "\\e[=1;2c",
    params: ["1", "2"],
    command: "=c",
  });
});
