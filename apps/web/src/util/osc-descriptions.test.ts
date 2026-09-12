import { test } from "node:test";
import assert from "node:assert/strict";
import { parse } from "@ansi-tools/parser";
import { parse as parseEscaped } from "@ansi-tools/parser/escaped";
import { describeOSC } from "./describe-osc.ts";

const cases = [
  ["8;;https://example.com/a;b", "hyperlink: https://example.com/a;b"],
  ["8;id=1;https://example.com/a;b?c=d;e", "hyperlink: https://example.com/a;b?c=d;e"],
  ["8;;", "hyperlink (end)"],
  ["8;id=1;", "hyperlink (end)"],
  ["8", "hyperlink"],
  ["8;id=1", "hyperlink"],
  ["52;c;?", "query clipboard data (targets: c)"],
  ["52;cpq0;?", "query clipboard data (targets: cpq0)"],
  ["52;;?", "query clipboard data (targets: terminal default)"],
  ["52;c;", "clear clipboard data (targets: c)"],
  ["52;;;", "write/clear clipboard data (targets: terminal default)"],
  ["52;c;SGVsbG8=", "write/clear clipboard data (targets: c)"],
  ["52;q;-", "write/clear clipboard data (targets: q)"],
  ["52", "manipulate clipboard"],
  ["9;hello;world", "send notification: hello;world"],
  ["9;4;0", "ConEmu progress: clear"],
  ["9;4;1;42", "ConEmu progress: in progress (42%)"],
  ["9;4;2", "ConEmu progress: error"],
  ["9;4;2;10", "ConEmu progress: error (10%)"],
  ["9;4;3", "ConEmu progress: indeterminate"],
  ["9;4;4;75", "ConEmu progress: paused (75%)"],
  ["9;4;99;hello", "send notification: 4;99;hello"],
  ["9;4;toString", "send notification: 4;toString"],
  ["21;foreground=red", "set window title (DEC) or set/read colors (Kitty)"],
  ["21;Window title", "set window title (DEC) or set/read colors (Kitty)"],
  ["22;left_ptr", "pointer shape control (xterm/Kitty): left_ptr"],
  ["22;>wait", "pointer shape control (xterm/Kitty): >wait"],
  ["4;1;?;2;rgb:ff/00/00", "palette color 1: query; palette color 2: set to rgb:ff/00/00"],
  ["4;15;?;42;?", "palette color 15: query; palette color 42: query"],
  ["4;1", "palette color 1: missing color"],
  ["5;0;?;4;red", "special color bold (0): query; special color italic (4): set to red"],
  ["5;7;?", "special color 7: query"],
  ["5;toString;?", "special color toString: query"],
  ["6;0;1", "enable special color bold (0)"],
  ["6;1;0", "disable special color underline (1)"],
  ["106;4;0", "disable special color italic (4)"],
  ["106;4;2", "enable special color italic (4)"],
  [
    "10;?;rgb:ff/00/00;?",
    "set/read text foreground color: query; set/read text background color: set to rgb:ff/00/00; set/read text cursor color: query",
  ],
  ["19;?;red", "change highlight foreground color: query; extra color data: red"],
  ["104", "reset all palette colors"],
  ["104;", "reset all palette colors"],
  ["104;1;2;15", "reset palette colors: 1, 2, 15"],
  ["105", "reset all special colors"],
  ["105;0;1;4", "reset special colors: bold (0), underline (1), italic (4)"],
  ["110", "reset text foreground color"],
  ["119", "reset highlight foreground color"],
  ["9999;custom;data", "unknown OSC command: 9999"],
] as const;

for (const [body, description] of cases) {
  test(`OSC description: ${body}`, () => {
    for (const codes of [parse("\x1b]" + body + "\x1b\\"), parseEscaped("\\e]" + body + "\\e\\\\")]) {
      assert.equal(codes.length, 1);
      const code = codes[0];
      assert.equal(code.type, "OSC");
      assert.equal(describeOSC(code).description, description);
    }
  });
}

test("OSC descriptions retain lookup mnemonic and numeric sorting", () => {
  const code = parse("\x1b]52;c;?\x07")[0];
  if (code.type === "TEXT") assert.fail("expected OSC");
  assert.deepEqual(describeOSC(code), {
    sort: 52,
    mnemonic: "OSC 52",
    description: "query clipboard data (targets: c)",
  });
});
