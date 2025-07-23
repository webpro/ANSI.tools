import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCSI, parsePrivateCSI } from "../src/parsers/csi.ts";
import type { TOKEN } from "../src/types.ts";

test("parseCSI simple command", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: "31" }];
  const final: TOKEN = { type: "FINAL", pos: 5, raw: "m" };
  assert.deepEqual(parseCSI(introducer, dataTokens, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[31m",
    command: "m",
    params: ["31"],
  });
});

test("parseCSI with multiple params", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: "1;31" }];
  const final: TOKEN = { type: "FINAL", pos: 7, raw: "m" };
  assert.deepEqual(parseCSI(introducer, dataTokens, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[1;31m",
    command: "m",
    params: ["1", "31"],
  });
});

test("parseCSI with missing parameters", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: ";31" }];
  const final: TOKEN = { type: "FINAL", pos: 6, raw: "m" };
  assert.deepEqual(parseCSI(introducer, dataTokens, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[;31m",
    command: "m",
    params: ["-1", "31"],
  });
});

test("parseCSI with trailing semicolon", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: "31;" }];
  const final: TOKEN = { type: "FINAL", pos: 7, raw: "m" };
  assert.deepEqual(parseCSI(introducer, dataTokens, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[31;m",
    command: "m",
    params: ["31", "-1"],
  });
});

test("parseCSI with colon-delimited SGR", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: "38:2:10:20:30" }];
  const final: TOKEN = { type: "FINAL", pos: 18, raw: "m" };
  assert.deepEqual(parseCSI(introducer, dataTokens, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[38:2:10:20:30m",
    command: "m",
    params: ["38", "2", "0", "10", "20", "30"],
  });
});

test("parseCSI with leading semicolon", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: ";" }];
  const final: TOKEN = { type: "FINAL", pos: 4, raw: "m" };
  assert.deepEqual(parseCSI(introducer, dataTokens, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[;m",
    command: "m",
    params: ["-1", "-1"],
  });
});

test("parseCSI with subparameters", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: "38;2;255;128;0" }];
  const final: TOKEN = { type: "FINAL", pos: 17, raw: "m" };
  assert.deepEqual(parseCSI(introducer, dataTokens, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[38;2;255;128;0m",
    command: "m",
    params: ["38", "2", "0", "255", "128", "0"],
  });
});

test("parseCSI with 48;2 background color", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: "48;2;128;64;32" }];
  const final: TOKEN = { type: "FINAL", pos: 17, raw: "m" };
  assert.deepEqual(parseCSI(introducer, dataTokens, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[48;2;128;64;32m",
    command: "m",
    params: ["48", "2", "0", "128", "64", "32"],
  });
});

test("parseCSI with 6-parameter 24-bit color (standards-compliant)", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: "38;2;0;255;128;64" }];
  const final: TOKEN = { type: "FINAL", pos: 19, raw: "m" };
  assert.deepEqual(parseCSI(introducer, dataTokens, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[38;2;0;255;128;64m",
    command: "m",
    params: ["38", "2", "0", "255", "128", "64"],
  });
});

test("parseCSI no data", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "CSI" };
  const dataTokens: TOKEN[] = [];
  const final: TOKEN = { type: "FINAL", pos: 3, raw: "m" };
  assert.deepEqual(parseCSI(introducer, dataTokens, final), {
    type: "CSI",
    pos: 0,
    raw: "\\e[m",
    command: "m",
    params: [],
  });
});

test("parsePrivateCSI with < introducer", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: "<31" }];
  const final: TOKEN = { type: "FINAL", pos: 6, raw: "m" };
  assert.deepEqual(parsePrivateCSI(introducer, dataTokens, final), {
    type: "PRIVATE",
    pos: 0,
    raw: "\\e[<31m",
    command: "<m",
    params: ["31"],
  });
});

test("parsePrivateCSI with > introducer", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: ">" }];
  const final: TOKEN = { type: "FINAL", pos: 4, raw: "c" };
  assert.deepEqual(parsePrivateCSI(introducer, dataTokens, final), {
    type: "PRIVATE",
    pos: 0,
    raw: "\\e[>c",
    command: ">c",
    params: [],
  });
});

test("parsePrivateCSI with = introducer", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: "=1;2" }];
  const final: TOKEN = { type: "FINAL", pos: 8, raw: "c" };
  assert.deepEqual(parsePrivateCSI(introducer, dataTokens, final), {
    type: "PRIVATE",
    pos: 0,
    raw: "\\e[=1;2c",
    command: "=c",
    params: ["1", "2"],
  });
});

test("parsePrivateCSI with colon in parameters", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: "<1:2" }];
  const final: TOKEN = { type: "FINAL", pos: 8, raw: "m" };
  assert.deepEqual(parsePrivateCSI(introducer, dataTokens, final), {
    type: "PRIVATE",
    pos: 0,
    raw: "\\e[<1:2m",
    command: "<m",
    params: ["1", "2"],
  });
});

test("parsePrivateCSI with > introducer and parameters", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: ">0;2" }];
  const final: TOKEN = { type: "FINAL", pos: 9, raw: "m" };
  assert.deepEqual(parsePrivateCSI(introducer, dataTokens, final), {
    type: "PRIVATE",
    pos: 0,
    raw: "\\e[>0;2m",
    command: ">m",
    params: ["0", "2"],
  });
});

test("parsePrivateCSI with > introducer and single parameter", () => {
  const introducer: TOKEN = { type: "INTRODUCER", pos: 0, raw: "\\e[", code: "CSI" };
  const dataTokens: TOKEN[] = [{ type: "DATA", pos: 3, raw: ">1" }];
  const final: TOKEN = { type: "FINAL", pos: 5, raw: "p" };
  assert.deepEqual(parsePrivateCSI(introducer, dataTokens, final), {
    type: "PRIVATE",
    pos: 0,
    raw: "\\e[>1p",
    command: ">p",
    params: ["1"],
  });
});
