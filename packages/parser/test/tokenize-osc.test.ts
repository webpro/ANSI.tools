import { test } from "node:test";
import "./helpers.ts";

test("OSC with BEL", t => {
  const input = String.raw`\x1b]0;title\x07`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 5, raw: "0;title" },
    { type: "FINAL", pos: 12, raw: "\\x07" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("OSC with ST", t => {
  const input = String.raw`\x1b]0;title\x9c`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 5, raw: "0;title" },
    { type: "FINAL", pos: 12, raw: "\\x9c" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("OSC with complex data", t => {
  const input = String.raw`\x1b]8;;https://example.com\x07`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 5, raw: "8;;https://example.com" },
    { type: "FINAL", pos: 27, raw: "\\x07" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("OSC with escape-backslash terminator", t => {
  const input = String.raw`\x1b]0;window title\e\\`;
  const expected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 5, raw: "0;window title" },
    { type: "FINAL", pos: 19, raw: "\\e\\\\" },
  ];
  t.assert.equalTokensDual(input, expected);
});

test("parseOSC with lengthy data stream", t => {
  const longData = "A".repeat(100);
  const oscInput = String.raw`\x1b]8;${longData}\x07`;
  const oscExpected = [
    { type: "INTRODUCER", pos: 0, raw: "\\x1b]", code: "\x9d" },
    { type: "DATA", pos: 5, raw: `8;${longData}` },
    { type: "FINAL", pos: 107, raw: "\\x07" },
  ];
  t.assert.equalTokensDual(oscInput, oscExpected);
});
