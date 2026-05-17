import assert from "node:assert/strict";
import { test } from "node:test";
import { parse } from "../src/parse.ts";
import { parse as parseEscaped } from "../src/parse.escaped.ts";
import type { CODE } from "../src/types.ts";

function only(codes: CODE[]): CODE {
  assert.equal(codes.length, 1, `expected one code, got ${codes.length}: ${JSON.stringify(codes)}`);
  return codes[0];
}

function check(raw: string, expected: { type: string; command: string; params: string[] }) {
  const c = only(parse(raw));
  if (c.type === "TEXT") assert.fail("expected a control code");
  assert.equal(c.type, expected.type);
  assert.equal(c.command, expected.command);
  assert.deepEqual(c.params, expected.params);
  assert.equal(c.raw, raw, "lossless");
}

test("OSC 52 clipboard (base64 payload)", () => {
  check("\x1b]52;c;SGVsbG8gV29ybGQ=\x07", { type: "OSC", command: "52", params: ["c", "SGVsbG8gV29ybGQ="] });
});

test("OSC 1337 (iTerm2, kept as single payload param)", () => {
  check("\x1b]1337;File=name=Zm9v;size=3:YWJj\x07", {
    type: "OSC",
    command: "1337",
    params: ["File=name=Zm9v;size=3:YWJj"],
  });
});

test("OSC 8 hyperlink with id, ST-terminated", () => {
  check("\x1b]8;id=xyz;https://example.com\x1b\\", {
    type: "OSC",
    command: "8",
    params: ["id=xyz", "https://example.com"],
  });
});

test("OSC 8 hyperlink close (empty params)", () => {
  check("\x1b]8;;\x07", { type: "OSC", command: "8", params: ["", ""] });
});

test("DCS DECRQSS request ($q)", () => {
  check("\x1bP$qm\x1b\\", { type: "DCS", command: "$q", params: ["m"] });
});

test("DCS DECRQSS response (generic DCS fallback)", () => {
  check("\x1bP1$r0;1m\x1b\\", { type: "DCS", command: "", params: ["1$r0;1m"] });
});

test("DCS Sixel (generic DCS fallback, payload preserved)", () => {
  check("\x1bPq#0;2;0;0;0#0~~@@vv@@~~@@~~$#1~~@@\x1b\\", {
    type: "DCS",
    command: "",
    params: ["q#0;2;0;0;0#0~~@@vv@@~~@@~~$#1~~@@"],
  });
});

test("escaped path: OSC 52 and DCS DECRQSS match raw path", () => {
  assert.deepEqual(
    parseEscaped(String.raw`\x1b]52;c;SGVsbG8=\x07`).map(c => ({ type: c.type, raw: c.raw })),
    [{ type: "OSC", raw: String.raw`\x1b]52;c;SGVsbG8=\x07` }]
  );
  assert.deepEqual(
    parseEscaped(String.raw`\x1bP$qm\x1b\\`).map(c => ({ type: c.type, raw: c.raw })),
    [{ type: "DCS", raw: String.raw`\x1bP$qm\x1b\\` }]
  );
});
