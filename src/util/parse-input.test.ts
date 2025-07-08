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
  });
});

test("Newlines (1)", () => {
  const input = String.raw`\u001b[31mAB\nCD`;
  const state = parseInput(input);
  assert.deepEqual(state, {
    map: [0, 11, 12, 14, 15, 16],
    greedyMap: [10, 11, 12, 14, 15, 16],
    reverseMap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 4, 5],
    visualWidth: 5,
    plain: "AB\nCD",
    unescaped: "\x1b[31mAB\nCD",
  });

  assert.equal(getPosition(state, 0, false), 0);
  assert.equal(getPosition(state, 1, false), 11);
  assert.equal(getPosition(state, 2, false), 12);

  assert.equal(getPosition(state, 0, true), 10);
  assert.equal(getPosition(state, 1, true), 11);
  assert.equal(getPosition(state, 2, true), 12);
});

test("Different newlines", () => {
  const input = String.raw`██ █\n█ ██\r\n██ █\r████`;
  const map = parseInput(input);
  assert.deepEqual(map, {
    map: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24],
    greedyMap: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24],
    reverseMap: [0, 1, 2, 3, 4, 4, 5, 6, 7, 8, 9, 9, 9, 9, 10, 11, 12, 13, 14, 14, 15, 16, 17, 18, 19],
    visualWidth: 19,
    plain: "██ █\n█ ██\n██ █\n████",
    unescaped: "██ █\n█ ██\n██ █\n████",
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
    unescaped: "\u001b]0;title\u001b\x07",
  });
});
