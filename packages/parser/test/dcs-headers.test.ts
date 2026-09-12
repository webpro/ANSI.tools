import assert from "node:assert/strict";
import { test } from "node:test";
import { parse, parser, tokenizer } from "../src/index.ts";
import { parse as parseEscaped, tokenizer as tokenizerEscaped } from "../src/escaped.ts";

function check(body: string, command: string, params: string[]) {
  for (const [start, end, escaped] of [
    ["\x1bP", "\x1b\\", false],
    ["\x90", "\x9c", false],
    ["\\x1bP", "\\x1b\\\\", true],
  ] as const) {
    const raw = start + body + end;
    const input = `ab${raw}tail`;
    const expected = [
      { type: "TEXT", pos: 0, raw: "ab" },
      { type: "DCS", pos: 2, raw, command, params },
      { type: "TEXT", pos: 2 + raw.length, raw: "tail" },
    ];
    assert.deepEqual(escaped ? parseEscaped(input) : parse(input), expected);
    assert.deepEqual([...parser(escaped ? tokenizerEscaped(input) : tokenizer(input))], expected);
  }
}

test("parameterized DCS commands retain their existing payload params", () => {
  check("0;1|17/4142", "|", ["0;1|17/4142"]);
  check(";1|17/4142", "|", [";1|17/4142"]);
  check("0;1;0;0;0;0;0;0{ @?", "{", ["0;1;0;0;0;0;0;0{ @?"]);
  check("1$pstate", "$p", ["1$pstate"]);
  check("2$t9/17/25", "$t", ["2$t9/17/25"]);
  check("2$u9/17/25", "$u", ["2$u9/17/25"]);
});

test("new DCS signatures preserve params with no parameter header", () => {
  check("$pstate", "$p", ["$pstate"]);
  check("$t9/17/25", "$t", ["$t9/17/25"]);
  check("$u9/17/25", "$u", ["$u9/17/25"]);
});

test("existing DCS prefix signatures retain their split params", () => {
  check("$qm", "$q", ["m"]);
  check("$q;", "$q", ["-1", "-1"]);
  check("+q436f;544e", "+q", ["436f", "544e"]);
  check("+p787465726d", "+p", ["787465726d"]);
  check("|17/4142;18/4344", "|", ["17/4142", "18/4344"]);
  check("{ @?;?", "{", [" @?", "?"]);
  check("$q", "$q", []);
});

test("unknown DCS bodies do not match signatures embedded in their payload", () => {
  for (const body of ["q~payload", "0;1q~payload", "unknown0;1|name", "1 $qm", "1:2|name", "?1|name", "1$"]) {
    check(body, "", [body]);
  }
});
