export const examples = [
  {
    label: "colors",
    value: String.raw`\u001b[31mRed\u001b[39m, \u001b[32mgreen\u001b[39m, and \u001b[44mblue background\u001b[49m.\n\n\x1b[38;2;255;255;0mH\x1b[0;1;3;35me\x1b[95ml\x1b[42ml\x1b[0;41mo\x1b[0m`,
  },
  {
    label: "mixed",
    value: String.raw`\x1b[3A\x1b[4D\x1b[sCursor \x1b[J\x1b[1;3Hmovements\x1b[u\x1b[13T\x1b[A\n\nPrivate sequences\n\e[>0c\e[>0;1f\e[>0g\e[>0;2m\e[>1p\e[=0c\e[<1h\e[<0;1;2c\n\n\x1b[K\x1b[1;32mOpened \x1b[1;4;34m%s\x1b[0;1;32m in your browser.\x1b[0m\n\n⭐ → ✨\n\n這裡有一些中文文字。\n\nThe End.`,
  },
  {
    label: "styles",
    value: String.raw`\u001b[1mBold\u001b[22m, \u001b[3mItalic\u001b[23m, \u001b[4mUnderline\u001b[24m, and \u001b[9mStrikethrough\u001b[29m.`,
  },
  {
    label: "commands",
    value: String.raw`\u001bc\u001b[2J\u001b[3J\u001b[?25l\u001b]0;Set Title\u0007An example of terminal commands.\n\n\x1bP$q"p\x1b\\\x1bP|0;1;50;#\x1b\\\x1bP{0;1;0\x1b\\\x1b_G a=T,s=100\x1b\\\x1b^secret\x1b\\\x1bXdata\x1b\\Regular text\x1b F`,
  },
  {
    label: "8-bit",
    value: String.raw`\u009b32mGreen text\u009b0m.`,
  },
  {
    label: "octal",
    value: String.raw`\033[31;1;4mHello\033[0m, \033[32mGreen text\033[0m.`,
  },
  {
    label: "hyperlinks",
    value: String.raw`- \u001b]8;;https://ansi.tools\u0007ANSI.tools\u001b]8;;\u0007\n- \u001b]8;;https://ansi.tools/lookup\u0007ANSI.tools lookup\u001b]8;;\u0007`,
  },
  {
    label: "test run",
    value: String.raw`\u001b[0m \u001b[0;32m✓\u001b[0m \u001b[0;2msrc/\u001b[0mindex\u001b[0;2m.test.ts (1)\u001b[0m\n\n  \u001b[0;2m Test Files \u001b[0m \u001b[0;1;32m1 passed\u001b[0;98m (1)\u001b[0m\n  \u001b[0;2m      Tests \u001b[0m \u001b[0;1;32m1 passed\u001b[0;98m (1)\u001b[0m\n  \u001b[0;2m   Start at \u001b[0m 23:32:41\n  \u001b[0;2m   Duration \u001b[0m 11ms\n\n  \u001b[42;1;39;0m PASS \u001b[0;32m Waiting for file changes...\u001b[0m\n         \u001b[0;2mpress \u001b[0;1mh\u001b[0;2m to show help, press \u001b[0;1mq\u001b[0;2m to quit`,
  },
  {
    label: "blocks",
    value: String.raw`\u001b[32m██ █\n█ ██\r\n██ █\r████\u001b[0m`,
  },
  {
    label: "ls/eza",
    value: String.raw`\x1b[36md\x1b[1;33mr\x1b[31mw\x1b[32mx\x1b[0m\x1b[33mr\x1b[1;90m-\x1b[0m\x1b[32mx\x1b[33mr\x1b[1;90m-\x1b[0m\x1b[32mx\x1b[0m     \x1b[1;90m-\x1b[0m \x1b[1;33mlars\x1b[0m \x1b[34m12 Jul 22:09\x1b[0m \x1b[36m.\x1b[0m\n\x1b[36md\x1b[1;33mr\x1b[31mw\x1b[32mx\x1b[0m\x1b[33mr\x1b[1;90m-\x1b[0m\x1b[32mx\x1b[33mr\x1b[1;90m-\x1b[0m\x1b[32mx\x1b[0m     \x1b[1;90m-\x1b[0m \x1b[1;33mlars\x1b[0m \x1b[34m12 Jul 17:01\x1b[0m \x1b[36m..\x1b[0m\n\x1b[36md\x1b[1;33mr\x1b[31mw\x1b[32mx\x1b[0m\x1b[33mr\x1b[1;90m-\x1b[0m\x1b[32mx\x1b[33mr\x1b[1;90m-\x1b[0m\x1b[32mx\x1b[0m     \x1b[1;90m-\x1b[0m \x1b[1;33mlars\x1b[0m \x1b[34m12 Jul 22:12\x1b[0m \x1b[36m.git\x1b[0m\n.\x1b[1;33mr\x1b[31mw\x1b[90m-\x1b[0m\x1b[33mr\x1b[1;90m--\x1b[0m\x1b[33mr\x1b[1;90m--\x1b[0m    \x1b[38;2;0;104;0m18\x1b[0m \x1b[1;33mlars\x1b[0m \x1b[34m24 Jun 16:54\x1b[0m .gitignore\n\x1b[36md\x1b[1;33mr\x1b[31mw\x1b[32mx\x1b[0m\x1b[33mr\x1b[1;90m-\x1b[0m\x1b[32mx\x1b[33mr\x1b[1;90m-\x1b[0m\x1b[32mx\x1b[0m     \x1b[1;90m-\x1b[0m \x1b[1;33mlars\x1b[0m \x1b[34m12 Jul 14:51\x1b[0m \x1b[36mdist\x1b[0m\n.\x1b[1;33mr\x1b[31mw\x1b[90m-\x1b[0m\x1b[33mr\x1b[1;90m--\x1b[0m\x1b[33mr\x1b[1;90m--\x1b[0m@ \x1b[1;38;2;0;104;0m3.1k\x1b[0m \x1b[1;33mlars\x1b[0m \x1b[34m12 Jul 17:05\x1b[0m \x1b[32mindex.html\x1b[0m\n\x1b[36md\x1b[1;33mr\x1b[31mw\x1b[32mx\x1b[0m\x1b[33mr\x1b[1;90m-\x1b[0m\x1b[32mx\x1b[33mr\x1b[1;90m-\x1b[0m\x1b[32mx\x1b[0m     \x1b[1;90m-\x1b[0m \x1b[1;33mlars\x1b[0m \x1b[34m12 Jul 19:21\x1b[0m \x1b[36mnode_modules\x1b[0m\n.\x1b[1;33mr\x1b[31mw\x1b[90m-\x1b[0m\x1b[33mr\x1b[1;90m--\x1b[0m\x1b[33mr\x1b[1;90m--\x1b[0m   \x1b[38;2;0;104;0m798\x1b[0m \x1b[1;33mlars\x1b[0m \x1b[34m12 Jul 19:46\x1b[0m \x1b[1;4;33mpackage.json\x1b[0m\n\x1b[36md\x1b[1;33mr\x1b[31mw\x1b[32mx\x1b[0m\x1b[33mr\x1b[1;90m-\x1b[0m\x1b[32mx\x1b[33mr\x1b[1;90m-\x1b[0m\x1b[32mx\x1b[0m     \x1b[1;90m-\x1b[0m \x1b[1;33mlars\x1b[0m \x1b[34m12 Jul 18:50\x1b[0m \x1b[36mpackages\x1b[0m\n.\x1b[1;33mr\x1b[31mw\x1b[90m-\x1b[0m\x1b[33mr\x1b[1;90m--\x1b[0m\x1b[33mr\x1b[1;90m--\x1b[0m   \x1b[1;38;2;0;104;0m39k\x1b[0m \x1b[1;33mlars\x1b[0m \x1b[34m12 Jul 19:21\x1b[0m pnpm-lock.yaml\n.\x1b[1;33mr\x1b[31mw\x1b[90m-\x1b[0m\x1b[33mr\x1b[1;90m--\x1b[0m\x1b[33mr\x1b[1;90m--\x1b[0m    \x1b[38;2;0;104;0m25\x1b[0m \x1b[1;33mlars\x1b[0m \x1b[34m12 Jul 18:57\x1b[0m pnpm-workspace.yaml\n\x1b[36md\x1b[1;33mr\x1b[31mw\x1b[32mx\x1b[0m\x1b[33mr\x1b[1;90m-\x1b[0m\x1b[32mx\x1b[33mr\x1b[1;90m-\x1b[0m\x1b[32mx\x1b[0m     \x1b[1;90m-\x1b[0m \x1b[1;33mlars\x1b[0m \x1b[34m 9 Jul 20:07\x1b[0m \x1b[36mpublic\x1b[0m\n.\x1b[1;33mr\x1b[31mw\x1b[90m-\x1b[0m\x1b[33mr\x1b[1;90m--\x1b[0m\x1b[33mr\x1b[1;90m--\x1b[0m    \x1b[38;2;0;104;0m96\x1b[0m \x1b[1;33mlars\x1b[0m \x1b[34m26 Jun 08:08\x1b[0m \x1b[32mREADME.md\x1b[0m\n\x1b[36md\x1b[1;33mr\x1b[31mw\x1b[32mx\x1b[0m\x1b[33mr\x1b[1;90m-\x1b[0m\x1b[32mx\x1b[33mr\x1b[1;90m-\x1b[0m\x1b[32mx\x1b[0m     \x1b[1;90m-\x1b[0m \x1b[1;33mlars\x1b[0m \x1b[34m12 Jul 22:09\x1b[0m \x1b[36mscripts\x1b[0m\n\x1b[36md\x1b[1;33mr\x1b[31mw\x1b[32mx\x1b[0m\x1b[33mr\x1b[1;90m-\x1b[0m\x1b[32mx\x1b[33mr\x1b[1;90m-\x1b[0m\x1b[32mx\x1b[0m     \x1b[1;90m-\x1b[0m \x1b[1;33mlars\x1b[0m \x1b[34m12 Jul 20:09\x1b[0m \x1b[36msrc\x1b[0m\n.\x1b[1;33mr\x1b[31mw\x1b[90m-\x1b[0m\x1b[33mr\x1b[1;90m--\x1b[0m\x1b[33mr\x1b[1;90m--\x1b[0m   \x1b[38;2;0;104;0m393\x1b[0m \x1b[1;33mlars\x1b[0m \x1b[34m12 Jul 19:03\x1b[0m \x1b[1;4;33mtsconfig.json\x1b[0m
`,
  },
];
