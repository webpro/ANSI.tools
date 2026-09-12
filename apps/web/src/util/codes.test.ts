import assert from "node:assert/strict";
import { test } from "node:test";
import { createRowsFromCodes } from "./table.ts";

test("DCS examples separate parameter headers from command payloads", () => {
  const rows = createRowsFromCodes().filter(row => row.type === "DCS");
  for (const [command, example] of [
    ["$q", "\\u001bP$qm\\u001b\\\\"],
    ["+q", "\\u001bP+q436f\\u001b\\\\"],
    ["+p", "\\u001bP+p787465726d\\u001b\\\\"],
    ["|", "\\u001bP0;1|17/4142\\u001b\\\\"],
    ["$t", "\\u001bP2$t9/17/25\\u001b\\\\"],
    ["$u", "\\u001bP2$u9/17/25\\u001b\\\\"],
  ]) {
    assert.equal(rows.find(row => row.sort === command)?.example, example, command);
  }
});

test("OSC lookup examples include their required separators", () => {
  const rows = createRowsFromCodes().filter(row => row.type === "OSC");
  assert.equal(rows.find(row => row.sort === 5)?.example, "\\u001b]5;0;rgb:ff/00/00\\u0007");
  assert.equal(rows.find(row => row.description === "hyperlink (end)")?.code, "␛]8;;ST");
});

test("mode 1039 has one definition for each operation", () => {
  const rows = createRowsFromCodes().filter(row => row.type === "DEC" && row.sort === "1039");
  assert.deepEqual(
    rows.map(row => row.description),
    ["enable Alt sends ESC prefix (xterm)", "disable Alt sends ESC prefix (xterm)"]
  );
});

test("mode 1048 generates cursor save and restore actions", () => {
  const rows = createRowsFromCodes().filter(row => row.type === "DEC" && row.sort === "1048");
  assert.deepEqual(
    rows.map(row => row.description),
    ["save cursor (xterm)", "restore cursor (xterm)"]
  );
});
