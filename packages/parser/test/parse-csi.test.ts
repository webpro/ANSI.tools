import { test } from "node:test";
import assert from "node:assert/strict";
import type { TOKEN } from "../src/types.ts";
import { parseCSI } from "../src/parsers/csi.ts";
import { tokenizeWithFinalizer } from "./helpers.ts";

test("parseCSI simple command", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[31m`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[31m",
    command: "m",
    params: ["31"],
  });
});

test("parseCSI with multiple params", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[1;31m`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[1;31m",
    command: "m",
    params: ["1", "31"],
  });
});

test("parseCSI with missing parameters", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[;31m`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[;31m",
    command: "m",
    params: ["0", "31"],
  });
});

test("parseCSI with trailing semicolon", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[31;m`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[31;m",
    command: "m",
    params: ["31", "0"],
  });
});

test("parseCSI with colon-delimited SGR", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[38:2:10:20:30m`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[38:2:10:20:30m",
    command: "m",
    params: ["38", "2", "0", "10", "20", "30"],
  });
});

test("parseCSI with leading semicolon", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[;m`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[;m",
    command: "m",
    params: ["0", "0"],
  });
});

test("parseCSI with subparameters", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[38;2;255;128;0m`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[38;2;255;128;0m",
    command: "m",
    params: ["38", "2", "0", "255", "128", "0"],
  });
});

test("parseCSI with 48;2 background color", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[48;2;128;64;32m`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[48;2;128;64;32m",
    command: "m",
    params: ["48", "2", "0", "128", "64", "32"],
  });
});

test("parseCSI with 6-parameter 24-bit color (standards-compliant)", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[38;2;0;255;128;64m`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[38;2;0;255;128;64m",
    command: "m",
    params: ["38", "2", "0", "255", "128", "64"],
  });
});

test("parseCSI no data", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[m`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[m",
    command: "m",
    params: [],
  });
});

test("parseCSI with < introducer", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[<31m`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "PRIVATE",
    pos: 0,
    raw: "\\e[<31m",
    command: "<m",
    params: ["31"],
  });
});

test("parseCSI with > introducer", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[>c`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "PRIVATE",
    pos: 0,
    raw: "\\e[>c",
    command: ">c",
    params: [],
  });
});

test("parseCSI with = introducer", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[=1;2c`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "PRIVATE",
    pos: 0,
    raw: "\\e[=1;2c",
    command: "=c",
    params: ["1", "2"],
  });
});

test("parseCSI with colon in parameters", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[<1:2m`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "PRIVATE",
    pos: 0,
    raw: "\\e[<1:2m",
    command: "<m",
    params: ["1", "2"],
  });
});

test("parseCSI with > introducer and parameters", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[>0;2m`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "PRIVATE",
    pos: 0,
    raw: "\\e[>0;2m",
    command: ">m",
    params: ["0", "2"],
  });
});

test("parseCSI with > introducer and single parameter", () => {
  const [introducer, data, final] = tokenizeWithFinalizer(String.raw`\e[>1p`);
  assert.deepEqual(parseCSI(introducer, data, final), {
    type: "PRIVATE",
    pos: 0,
    raw: "\\e[>1p",
    command: ">p",
    params: ["1"],
  });
});
