import { test } from "node:test";
import assert from "node:assert/strict";
import { parseInput, getPosition } from "./parse-input.ts";

test("Empty string", () => {
  const input = "";
  const map = parseInput(input);
  assert.deepEqual(map, {
    map: [0],
    greedyMap: [0],
    reverseMap: [0],
    visualWidth: 0,
    plain: "",
    unescaped: "",
    codes: [],
  });
});

test("Plain text", () => {
  const input = "Hello World";
  const map = parseInput(input);
  assert.deepEqual(map, {
    map: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    greedyMap: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    reverseMap: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    visualWidth: 11,
    plain: "Hello World",
    unescaped: "Hello World",
    codes: [{ type: "TEXT", pos: 0, raw: "Hello World" }],
  });
});

test("Escape sequence at beginning", () => {
  const input = String.raw`\x1b[31mAB`;
  const state = parseInput(input);
  assert.deepEqual(state, {
    map: [0, 9, 10],
    greedyMap: [8, 9, 10],
    reverseMap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2],
    visualWidth: 2,
    plain: "AB",
    unescaped: "\u001b[31mAB",
    codes: [
      { type: "CSI", pos: 0, raw: "\\x1b[31m", params: ["31"], command: "m" },
      { type: "TEXT", pos: 8, raw: "AB" },
    ],
  });

  assert.equal(getPosition(state, 0, false), 0);
  assert.equal(getPosition(state, 1, false), 9);
  assert.equal(getPosition(state, 2, false), 10);

  assert.equal(getPosition(state, 0, true), 8);
  assert.equal(getPosition(state, 1, true), 9);
  assert.equal(getPosition(state, 2, true), 10);
});

test("Alternating escape sequence", () => {
  const input = String.raw`\x1b[38;2;255;255;0mH\x1b[0;1;3;35me\x1b[95ml\x1b[42ml\x1b[0;41mo\x1b[0m`;
  const map = parseInput(input);
  assert.deepEqual(map, {
    map: [0, 21, 36, 45, 54, 65],
    greedyMap: [20, 35, 44, 53, 64, 72],
    reverseMap: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2,
      2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5,
    ],
    visualWidth: 5,
    plain: "Hello",
    unescaped: "\u001b[38;2;255;255;0mH\u001b[0;1;3;35me\u001b[95ml\u001b[42ml\u001b[0;41mo\u001b[0m",
    codes: [
      { type: "CSI", pos: 0, raw: "\\x1b[38;2;255;255;0m", params: ["38", "2", "255", "255", "0"], command: "m" },
      { type: "TEXT", pos: 20, raw: "H" },
      { type: "CSI", pos: 21, raw: "\\x1b[0;1;3;35m", params: ["0", "1", "3", "35"], command: "m" },
      { type: "TEXT", pos: 35, raw: "e" },
      { type: "CSI", pos: 36, raw: "\\x1b[95m", params: ["95"], command: "m" },
      { type: "TEXT", pos: 44, raw: "l" },
      { type: "CSI", pos: 45, raw: "\\x1b[42m", params: ["42"], command: "m" },
      { type: "TEXT", pos: 53, raw: "l" },
      { type: "CSI", pos: 54, raw: "\\x1b[0;41m", params: ["0", "41"], command: "m" },
      { type: "TEXT", pos: 64, raw: "o" },
      { type: "CSI", pos: 65, raw: "\\x1b[0m", params: ["0"], command: "m" },
    ],
  });
});

test("Subsequent escape sequences", () => {
  const input = String.raw`\x1b[A\r\x1b[K\x1b[1;32mO`;
  const map = parseInput(input);
  assert.deepEqual(map, {
    map: [0, 8, 25],
    greedyMap: [6, 24, 25],
    reverseMap: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    visualWidth: 2,
    plain: "\nO",
    unescaped: "\x1b[A\n\x1b[K\x1b[1;32mO",
    codes: [
      { type: "CSI", pos: 0, raw: "\\x1b[A", command: "A", params: [] },
      { type: "TEXT", pos: 6, raw: "\\r" },
      { type: "CSI", pos: 8, raw: "\\x1b[K", command: "K", params: [] },
      { type: "CSI", pos: 14, raw: "\\x1b[1;32m", params: ["1", "32"], command: "m" },
      { type: "TEXT", pos: 24, raw: "O" },
    ],
  });
});

test("Cursor position sequence", () => {
  const input = String.raw`\x1b[sHello\x1b[u`;
  const map = parseInput(input);
  assert.deepEqual(map, {
    map: [0, 7, 8, 9, 10, 11],
    greedyMap: [6, 7, 8, 9, 10, 17],
    reverseMap: [0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 5, 5, 5, 5, 5, 5],
    visualWidth: 5,
    plain: "Hello",
    unescaped: "\u001b[sHello\u001b[u",
    codes: [
      { type: "CSI", pos: 0, raw: "\\x1b[s", command: "s", params: [] },
      { type: "TEXT", pos: 6, raw: "Hello" },
      { type: "CSI", pos: 11, raw: "\\x1b[u", command: "u", params: [] },
    ],
  });
});

test("Mixed escape sequences", () => {
  const input = String.raw`\033[31;1;4mHello\033[0m, \033[32mGreen text\033[0m.`;
  const map = parseInput(input);
  assert.deepEqual(map, {
    map: [0, 13, 14, 15, 16, 17, 25, 26, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 52],
    greedyMap: [12, 13, 14, 15, 16, 24, 25, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 51, 52],
    reverseMap: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 5, 5, 5, 5, 5, 5, 5, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 9, 10,
      11, 12, 13, 14, 15, 16, 17, 17, 17, 17, 17, 17, 17, 17, 18,
    ],
    visualWidth: 18,
    plain: "Hello, Green text.",
    unescaped: "\u001b[31;1;4mHello\u001b[0m, \u001b[32mGreen text\u001b[0m.",
    codes: [
      { type: "CSI", pos: 0, raw: "\\033[31;1;4m", params: ["31", "1", "4"], command: "m" },
      { type: "TEXT", pos: 12, raw: "Hello" },
      { type: "CSI", pos: 17, raw: "\\033[0m", params: ["0"], command: "m" },
      { type: "TEXT", pos: 24, raw: ", " },
      { type: "CSI", pos: 26, raw: "\\033[32m", params: ["32"], command: "m" },
      { type: "TEXT", pos: 34, raw: "Green text" },
      { type: "CSI", pos: 44, raw: "\\033[0m", params: ["0"], command: "m" },
      { type: "TEXT", pos: 51, raw: "." },
    ],
  });
});

test("Newlines & unicode", () => {
  const input = String.raw`██👍🏻█\n█🌍██\r\n██𝒜█\r████`;
  const map = parseInput(input);
  assert.deepEqual(map, {
    map: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24],
    greedyMap: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24],
    reverseMap: [0, 1, 2, 3, 4, 4, 5, 6, 7, 8, 9, 9, 9, 9, 10, 11, 12, 13, 14, 14, 15, 16, 17, 18, 19],
    visualWidth: 19,
    plain: "██👍🏻█\n█🌍██\n██𝒜█\n████",
    unescaped: "██👍🏻█\n█🌍██\n██𝒜█\n████",
    codes: [{ type: "TEXT", pos: 0, raw: "██👍🏻█\\n█🌍██\\r\\n██𝒜█\\r████" }],
  });
});

test("Escape sequences without visible characters", () => {
  const input = String.raw`\x1b[31m\x1b[0m`;
  const map = parseInput(input);
  assert.deepEqual(map, {
    map: [0],
    greedyMap: [15],
    reverseMap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    visualWidth: 0,
    plain: "",
    unescaped: "\u001b[31m\u001b[0m",
    codes: [
      { type: "CSI", pos: 0, raw: "\\x1b[31m", params: ["31"], command: "m" },
      { type: "CSI", pos: 8, raw: "\\x1b[0m", params: ["0"], command: "m" },
    ],
  });
});

test("Hyperlinks", () => {
  const input = String.raw`- \u001b]8;;https://e.org\u0007text\u001b]8;;\u0007\n- \u001b]8;;https://e.org/next\u0007next\u001b]8;;\u0007`;
  const map = parseInput(input);
  assert.deepEqual(map, {
    map: [0, 1, 2, 32, 33, 34, 35, 53, 54, 55, 90, 91, 92, 93],
    greedyMap: [0, 1, 31, 32, 33, 34, 51, 53, 54, 89, 90, 91, 92, 109],
    reverseMap: [
      0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 4, 5, 6, 6, 6,
      6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
      9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 11, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
      13, 13,
    ],
    visualWidth: 13,
    plain: "- text\n- next",
    unescaped: "- \x1b]8;;https://e.orgtext\x1b]8;;\n- \x1b]8;;https://e.org/nextnext\x1b]8;;",
    codes: [
      { type: "TEXT", pos: 0, raw: "- " },
      { type: "OSC", pos: 2, raw: "\\u001b]8;;https://e.org\\u0007", params: ["", "https://e.org"], command: "8" },
      { type: "TEXT", pos: 31, raw: "text" },
      { type: "OSC", pos: 35, raw: "\\u001b]8;;\\u0007", params: ["", ""], command: "8" },
      { type: "TEXT", pos: 51, raw: "\\n- " },
      {
        type: "OSC",
        pos: 55,
        raw: "\\u001b]8;;https://e.org/next\\u0007",
        params: ["", "https://e.org/next"],
        command: "8",
      },
      { type: "TEXT", pos: 89, raw: "next" },
      { type: "OSC", pos: 93, raw: "\\u001b]8;;\\u0007", params: ["", ""], command: "8" },
    ],
  });
});

test("\\e escape sequence and terminators", () => {
  const input = String.raw`\e]0;title\a\e]0;title2\x07`;
  const state = parseInput(input);
  assert.deepEqual(state, {
    map: [0],
    greedyMap: [27],
    reverseMap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    visualWidth: 0,
    plain: "",
    unescaped: "\u001b]0;title\u0007\u001b]0;title2\u0007",
    codes: [
      { type: "OSC", pos: 0, raw: "\\e]0;title\\a", params: ["title"], command: "0" },
      { type: "OSC", pos: 12, raw: "\\e]0;title2\\x07", params: ["title2"], command: "0" },
    ],
  });
});

test("OSC \\ terminator", () => {
  const input = String.raw`\x1b]0;title\x1b\\`;
  const state = parseInput(input);
  assert.deepEqual(state, {
    map: [0],
    greedyMap: [18],
    reverseMap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    visualWidth: 0,
    plain: "",
    unescaped: "\u001b]0;title\u001b\\",
    codes: [{ type: "OSC", pos: 0, raw: "\\x1b]0;title\\x1b\\\\", params: ["title"], command: "0" }],
  });
});

test("OSC 133 - Set Mark", () => {
  const input = String.raw`\x1b]133;A\x1b\\`;
  const { visualWidth, plain, unescaped } = parseInput(input);
  assert.equal(visualWidth, 0);
  assert.equal(plain, "");
  assert.equal(unescaped, "\u001b]133;A\u001b\\");
});

test("OSC 1337 - Set User Variable", () => {
  const input = String.raw`\x1b]1337;SetUserVar=foo=YmFy\x07`;
  const { visualWidth, plain, unescaped } = parseInput(input);
  assert.equal(visualWidth, 0);
  assert.equal(plain, "");
  assert.equal(unescaped, "\u001b]1337;SetUserVar=foo=YmFy\u0007");
});

test("OSC 1337 - Set Current Directory", () => {
  const input = String.raw`\x1b]1337;CurrentDir=/Users/george\x07`;
  const { visualWidth, plain, unescaped } = parseInput(input);
  assert.equal(visualWidth, 0);
  assert.equal(plain, "");
  assert.equal(unescaped, "\u001b]1337;CurrentDir=/Users/george\u0007");
});

test("ESC - Set G1 Charset to UK", () => {
  const input = String.raw`\x1b(Ab`;
  const { visualWidth, plain, unescaped, codes } = parseInput(input);
  assert.equal(visualWidth, 1);
  assert.equal(plain, "b");
  assert.equal(unescaped, "\u001b(Ab");
  assert.deepEqual(codes, [
    { type: "ESC", pos: 0, raw: "\\x1b(A", command: "(", params: ["A"] },
    { type: "TEXT", pos: 6, raw: "b" },
  ]);
});

test("DEC Private Mode - Enable Alternate Screen Buffer", () => {
  const input = String.raw`\x1b[?1049h`;
  const { visualWidth, plain, unescaped } = parseInput(input);
  assert.equal(visualWidth, 0);
  assert.equal(plain, "");
  assert.equal(unescaped, "\u001b[?1049h");
});
