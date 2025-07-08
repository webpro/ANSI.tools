import { unescapeInput } from "./ansi.ts";

const code = "(\\\\u001b|\\\\x1b|\\\\033|\\\\e)";
const value = "(\\[.*?[@-~]|\\].*?(\\\\u0007|\\\\a|\\\\x07)|[a-zA-Z]|c)?";
const INVISIBLE_ANSI = new RegExp(`^(${code}${value}|\\\\u009b(.*?[@-~])?)`);

interface ParsedInput {
  map: number[];
  greedyMap: number[];
  reverseMap: number[];
  visualWidth: number;
  plain: string;
  unescaped: string;
}

function parseToken(input: string, index: number) {
  const char = input[index];

  if (char !== "\\") {
    return { original: char, unescaped: char, isVisible: getCharacterWidth(char) > 0, nextIndex: index + 1 };
  }

  const remaining = input.slice(index);

  const newlineMatch = remaining.match(/^\\(r\\n|[rn])/);
  if (newlineMatch) {
    return { original: newlineMatch[0], unescaped: "\n", isVisible: true, nextIndex: index + newlineMatch[0].length };
  }

  const terminatorMatch = remaining.match(/^\\(u0007|a|x07)/);
  if (terminatorMatch) {
    const original = terminatorMatch[0];
    const unescaped = unescapeInput(original);
    return { original, unescaped, isVisible: false, nextIndex: index + original.length };
  }

  const invisibleMatch = remaining.match(INVISIBLE_ANSI);
  if (invisibleMatch) {
    const original = invisibleMatch[0];
    const unescaped = unescapeInput(original);
    return { original, unescaped, isVisible: false, nextIndex: index + original.length };
  }

  return { original: char, unescaped: char, isVisible: getCharacterWidth(char) > 0, nextIndex: index + 1 };
}

export function parseInput(input: string): ParsedInput {
  const map: number[] = [0];
  const greedyMap: number[] = [];
  const reverseMap: number[] = [];
  let plain = "";
  let unescaped = "";
  let visualWidth = 0;
  let i = 0;

  while (i < input.length) {
    const token = parseToken(input, i);
    if (token) {
      unescaped += token.unescaped;

      for (let j = i; j < token.nextIndex; j++) {
        reverseMap.push(visualWidth);
      }

      if (token.isVisible) {
        plain += token.unescaped;
        greedyMap.push(i);
        map.push(token.nextIndex);
        visualWidth++;
      }
    }

    i = token.nextIndex;
  }

  greedyMap.push(i);
  reverseMap.push(visualWidth);

  return { map, greedyMap, reverseMap, visualWidth, plain, unescaped };
}

function getCharacterWidth(char: string): number {
  const codePoint = char.codePointAt(0);
  if (!codePoint) return 0;
  if (codePoint === 10 || codePoint === 13) return 1;
  if (codePoint < 32 || (codePoint >= 127 && codePoint < 160)) return 0;
  return 1;
}

export function getVisualWidth(input: string): number {
  let width = 0;
  let i = 0;

  while (i < input.length) {
    const token = parseToken(input, i);
    if (token) {
      width += token.isVisible ? 1 : 0;
      i = token.nextIndex;
    } else {
      i++;
    }
  }

  return width;
}

export function getPosition(state: ParsedInput, pos: number, isGreedy: boolean): number {
  if (pos < 0) return 0;
  if (isGreedy) return state.greedyMap[pos];
  return state.map[pos];
}

export function getPositionReversed(state: ParsedInput, pos: number): number {
  if (pos < 0) return 0;
  return state.reverseMap[pos];
}
