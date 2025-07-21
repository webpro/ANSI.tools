import { parse } from "@ansi-tools/parser/escaped";
import { parse as parseRaw } from "@ansi-tools/parser";
import { getSegments, mapDECSpecialGraphics, unescapeInput } from "./string.ts";
import type { CODE } from "@ansi-tools/parser";

type PROCESSED_CODE = CODE & {
  plain?: string;
};

interface ParsedInput {
  map: number[];
  greedyMap: number[];
  reverseMap: number[];
  visualWidth: number;
  plain: string;
  codes: PROCESSED_CODE[];
  isRaw: boolean;
}

function isRawInput(input: string): boolean {
  return input.includes("\u001b");
}

function getNewlineLength(text: string[], index: number): number {
  if (text[index] === "\\") {
    if (text[index + 1] === "r" && text[index + 2] === "\\" && text[index + 3] === "n") return 4;
    else if (text[index + 1] === "r" || text[index + 1] === "n") return 2;
  }
  return 0;
}

export function parseInput(input: string): ParsedInput {
  const map: number[] = [0];
  const greedyMap: number[] = [];
  const reverseMap: number[] = [];
  let plain = "";
  let visualWidth = 0;
  let i = 0;
  let isDECSpecialGraphics = false;

  const isRaw = isRawInput(input);
  const codes: PROCESSED_CODE[] = isRaw ? parseRaw(input) : parse(input);

  for (const code of codes) {
    const text = code.raw;
    if (code.type === "TEXT") {
      const p = code.pos;
      const t = getSegments(text);
      let _plain = "";
      for (let j = 0; j < t.length; ) {
        const nl = getNewlineLength(t, j);
        if (nl > 0) {
          _plain += "\n";
          for (let v = 0; v < nl; v++) reverseMap.push(visualWidth);
        } else {
          _plain += isDECSpecialGraphics ? mapDECSpecialGraphics(t[j]) : t[j];
          reverseMap.push(visualWidth);
        }
        const l = nl || 1;
        map.push(p + j + l);
        greedyMap.push(p + j);
        visualWidth += 1;
        j += l;
      }
      code.plain = _plain;
      plain += _plain;
      i += t.length;
    } else {
      if (code.type === "ESC" && code.command === "(") {
        if (code.params?.[0] === "0") isDECSpecialGraphics = true;
        else if (code.params?.[0] === "B") isDECSpecialGraphics = false;
      }
      for (let j = 0; j < text.length; j++) reverseMap.push(visualWidth);
      i += text.length;
    }
  }

  greedyMap.push(i);
  reverseMap.push(visualWidth);

  return { map, greedyMap, reverseMap, visualWidth, plain: unescapeInput(plain), codes, isRaw };
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
