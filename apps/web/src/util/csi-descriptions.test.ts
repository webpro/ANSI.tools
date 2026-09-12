import assert from "node:assert/strict";
import { test } from "node:test";
import { parse } from "@ansi-tools/parser";
import { parse as parseEscaped } from "@ansi-tools/parser/escaped";
import { describeCSI, describeDEC, describePRIVATE } from "./describe-csi.ts";

const cases = [
  ["?2J", "selective erase: entire screen", "DECSED"],
  ["?J", "selective erase: from cursor to end of screen", "DECSED"],
  ["?1K", "selective erase: from cursor to beginning of line", "DECSEL"],
  ["?6n", "DEC device status report: report cursor pos", "DSR"],
  ["?1;2R", "DEC cursor pos report (row 1, col 2, page 1)", "DECXCPR"],
  ["?1;2c", "primary device attributes response: 1;2", "DA"],
  ["?25$p", "request DEC mode: show cursor", "DECRQM"],
  ["?25;1$y", "report DEC mode: show cursor: set", "DECRPM"],
  ["?25;4$y", "report DEC mode: show cursor: permanently reset", "DECRPM"],
  ["4$p", "request ANSI mode: insert mode (IRM)", "DECRQM"],
  ["4;2$y", "report ANSI mode: insert mode (IRM): reset", "DECRPM"],
  ["?25;7h", "enable show cursor; enable auto-wrap mode", "DECTCEM, DECAWM"],
  ["?25;7l", "disable show cursor; disable auto-wrap mode", "DECTCEM, DECAWM"],
  ["?0025;0007h", "enable show cursor; enable auto-wrap mode", "DECTCEM, DECAWM"],
  ["?25:7h", "unknown DEC mode: 25:7", ""],
  ["?1048h", "save cursor (xterm)", ""],
  ["?1048l", "restore cursor (xterm)", ""],
  ["4;20h", "set mode: insert mode (IRM), automatic newline (LNM)", "SM"],
  ["4;20l", "reset mode: replace mode (IRM), normal linefeed (LNM)", "RM"],
  [">0c", "secondary device attributes request", "DA2"],
  [">c", "secondary device attributes request", "DA2"],
  [">61;20;1c", "secondary device attributes response: 61;20;1", "DA2"],
  [">0;95;0c", "secondary device attributes response: 0;95;0", "DA2"],
  [">99c", "secondary device attributes: 99", "DA2"],
  [">1:2;20;1c", "secondary device attributes: 1:2;20;1", "DA2"],
  [">4;2m", "set/reset key modifier options (xterm): modifyOtherKeys = 2", "XTMODKEYS"],
  [">4m", "set/reset key modifier options (xterm): modifyOtherKeys (initial value)", "XTMODKEYS"],
  [">m", "set/reset key modifier options (xterm): all resources to initial values", "XTMODKEYS"],
  [">1s", "set shift-escape behavior (xterm): conditionally allow shift-key as modifier in mouse protocol", "XTSHIFTESCAPE"],
  [">s", "set shift-escape behavior (xterm): allow shift-key to override mouse protocol", "XTSHIFTESCAPE"],
  ["<0;1;1m", "SGR mouse release (button 0, col 1, row 1)", ""],
  ["<0;1;1M", "SGR mouse press/motion (button 0, col 1, row 1)", ""],
  ["?25s", "save DEC modes (xterm): show cursor", "XTSAVE"],
  ["?25r", "restore DEC modes (xterm) or enter/exit PCTerm mode (DECPCTERM): 25", "XTRESTORE"],
  ["2H", "move cursor pos (row 2, col 1)", "CUP"],
  ["H", "move cursor pos (row 1, col 1)", "CUP"],
  [";H", "move cursor pos (row 1, col 1)", "CUP"],
  ["0;0H", "move cursor pos (row 1, col 1)", "CUP"],
  ["0A", "move cursor up (1 rows)", "CUU"],
  ["1;0r", "set scrolling region (top 1, bottom screen height)", "DECSTBM"],
  ["r", "set scrolling region (top 1, bottom screen height)", "DECSTBM"],
  ["0 q", "set cursor style (style 0)", "DECSCUSR"],
  [" q", "set cursor style (style 1)", "DECSCUSR"],
  ["0;0 B", "graphic size modification (height 0%, width 0%)", "GSM"],
  ["?25;9$y", "report DEC mode: show cursor: unknown status: 9", "DECRPM"],
  ["?9999h", "unknown DEC mode: 9999", ""],
  ["?999999999999999999999h", "unknown DEC mode: 999999999999999999999", ""],
  ["?25z", "unknown CSI sequence: ?z", ""],
  [">1z", "unknown CSI sequence: >z", ""],
  ["999h", "set mode: unknown ANSI mode: 999", "SM"],
] as const;

for (const [body, description, mnemonic] of cases) {
  test(`CSI description: ${body}`, () => {
    for (const codes of [parse("\x1b[" + body), parseEscaped("\\e[" + body)]) {
      assert.equal(codes.length, 1);
      const code = codes[0];
      if (code.type === "TEXT") assert.fail("expected a CSI sequence");
      const result =
        code.type === "DEC" ? describeDEC(code) : code.type === "PRIVATE" ? describePRIVATE(code) : describeCSI(code);
      assert.equal(result.description, description);
      assert.equal(result.mnemonic, mnemonic);
    }
  });
}

test("CSI s explains the mode-dependent interpretations without assuming mode 69", () => {
  for (const body of ["s", "1;20s"]) {
    const code = parse("\x1b[" + body)[0];
    if (code.type === "TEXT") assert.fail("expected a CSI sequence");
    const result = describeCSI(code);
    assert.match(result.description, /save cursor \(mode 69 off\)/);
    assert.match(result.description, /set left\/right margins \(mode 69 on\)/);
  }
});
