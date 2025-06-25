export const examples = [
  {
    label: "colors",
    value: "\u001b[31mRed\u001b[39m, \u001b[32mgreen\u001b[39m, and \u001b[44mblue background\u001b[49m.",
  },
  {
    label: "colors (rgb)",
    value: "\x1b[38;2;255;255;0mH\x1b[0;1;3;35me\x1b[95ml\x1b[42ml\x1b[0;41mo\x1b[0m",
  },
  {
    label: "cursor",
    value: "\x1b[3A\x1b[4D\x1b[shello\x20\x1b[J\x1b[1;3Hworld\x1b[u\x1b[13T",
  },
  {
    label: "mixed",
    value:
      "\x1b[A\r\x1b[K\x1b[1;32mOpened \x1b[1;4;34m%s\x1b[0;1;32m in your browser.\x1b[0m\n\n⭐ → ✨\n\n這裡有一些中文文字。\n\nThe End.",
  },
  {
    label: "styles",
    value:
      "\u001b[1mBold\u001b[22m, \u001b[3mItalic\u001b[23m, \u001b[4mUnderline\u001b[24m, and \u001b[9mStrikethrough\u001b[29m.",
  },
  {
    label: "commands",
    value: "\u001bc\u001b[2J\u001b[3J\u001b[?25l\u001b]0;Set Title\u0007An example of terminal commands.",
  },
  {
    label: "8-bit",
    value: "\u009b32mGreen text\u009b0m.",
  },
  {
    label: "octal",
    value: "\\033[31;1;4mHello\\033[0m, \\033[32mgreen text\\033[0m.",
  },
  {
    label: "hyperlinks",
    value:
      "- \u001b]8;;https://ansi.tools\u0007ANSI.tools\u001b]8;;\u0007\n- \u001b]8;;https://ansi.tools/lookup\u0007ANSI.tools lookup\u001b]8;;\u0007",
  },
  {
    label: "blocks",
    value: "██ █\n█ ██\r\n██ █\r████",
  },
];
