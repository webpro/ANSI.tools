import {
  BACKSLASH,
  BACKSLASH_CODE,
  BELL,
  BELL_CODE,
  CSI,
  CSI_CODE,
  CSI_OPEN,
  ESC,
  ESC_CODE,
  OSC,
  OSC_CODE,
  OSC_OPEN,
  ST,
  ST_CODE,
  STRING_OPENERS,
  TOKEN_TYPES,
} from "./constants.ts";
import type { TOKEN } from "./types.ts";
import { is8BitIntroducer, isC0Interrupter, isInterrupter } from "./tokenize.helpers.ts";

export function* tokenizer(input: string): IterableIterator<TOKEN> {
  let i = 0;
  let state = 0; // 0 = GROUND, 1 = SEQUENCE
  let currentCode = 0;
  const len = input.length;

  while (i < len) {
    if (state === 0) {
      const textStart = i;
      let charCode = input.charCodeAt(i);

      while (i < len && charCode !== ESC && (charCode < 0x90 || !is8BitIntroducer(charCode))) {
        charCode = input.charCodeAt(++i);
      }

      if (i > textStart) {
        yield { type: TOKEN_TYPES.TEXT, pos: textStart, raw: input.substring(textStart, i) };
      }

      if (i >= len) break;

      if (is8BitIntroducer(charCode)) {
        yield { type: TOKEN_TYPES.INTRODUCER, pos: i, raw: input[i], code: input[i] };
        i++;
        state = 1;
        currentCode = charCode;
      } else {
        // ESC
        let nextPos = i + 1;
        while (nextPos < len && input.charCodeAt(nextPos) === 0) nextPos++;
        const nextCode = input.charCodeAt(nextPos);
        if (nextCode === CSI_OPEN) {
          yield { type: TOKEN_TYPES.INTRODUCER, pos: i, raw: input.substring(i, nextPos + 1), code: CSI_CODE };
          i = nextPos + 1;
          state = 1;
          currentCode = CSI;
        } else if (nextCode === OSC_OPEN) {
          yield { type: TOKEN_TYPES.INTRODUCER, pos: i, raw: input.substring(i, nextPos + 1), code: OSC_CODE };
          i = nextPos + 1;
          state = 1;
          currentCode = OSC;
        } else if (nextPos < len && STRING_OPENERS.has(input[nextPos])) {
          yield { type: TOKEN_TYPES.INTRODUCER, pos: i, raw: input.substring(i, nextPos + 1), code: input[nextPos] };
          i = nextPos + 1;
          state = 1;
          currentCode = nextCode;
        } else if (nextPos < len) {
          let j = nextPos;
          let intermediate = "";
          while (j < len) {
            const code = input.charCodeAt(j);
            if (code === 0) j++;
            else if (code >= 0x20 && code <= 0x2f) intermediate += input[j++];
            else break;
          }
          if (intermediate) {
            yield { type: TOKEN_TYPES.INTRODUCER, pos: i, raw: input.substring(i, j), code: ESC_CODE, intermediate };
          } else {
            yield { type: TOKEN_TYPES.INTRODUCER, pos: i, raw: input.substring(i, j), code: ESC_CODE };
          }
          i = j;
          if (j < len) {
            state = 1;
            currentCode = ESC;
          }
        } else {
          yield { type: TOKEN_TYPES.INTRODUCER, pos: i, raw: input.substring(i, nextPos), code: ESC_CODE };
          i = nextPos;
        }
      }
    } else {
      const pos = i;

      if (currentCode === CSI) {
        let dataStart = i;
        while (i < len) {
          const charCode = input.charCodeAt(i);
          if (charCode >= 0x20 && charCode < 0x40) {
            i++;
            continue;
          }
          if (charCode === 0) {
            if (i > dataStart) yield { type: TOKEN_TYPES.DATA, pos: dataStart, raw: input.substring(dataStart, i) };
            yield { type: TOKEN_TYPES.DATA, pos: i, raw: input[i], code: "" };
            dataStart = ++i;
            continue;
          }
          if (isInterrupter(charCode)) {
            if (i > dataStart) yield { type: TOKEN_TYPES.DATA, pos: dataStart, raw: input.substring(dataStart, i) };
            state = 0;
            if (isC0Interrupter(charCode)) {
              yield { type: TOKEN_TYPES.TEXT, pos: i, raw: input[i] };
              i++;
            }
            break;
          }
          if (charCode >= 0x40 && charCode <= 0x7e) {
            if (i > dataStart) yield { type: TOKEN_TYPES.DATA, pos: dataStart, raw: input.substring(dataStart, i) };
            yield { type: TOKEN_TYPES.FINAL, pos: i, raw: input[i] };
            i++;
            state = 0;
            break;
          }
          i++;
        }
        if (state === 1 && i > dataStart)
          yield { type: TOKEN_TYPES.DATA, pos: dataStart, raw: input.substring(dataStart, i) };
      } else if (currentCode === ESC) {
        if (i < len) {
          const charCode = input.charCodeAt(i);
          if (isInterrupter(charCode)) {
            state = 0;
            if (isC0Interrupter(charCode)) {
              yield { type: TOKEN_TYPES.TEXT, pos: i, raw: input[i] };
              i++;
            }
          } else {
            yield { type: TOKEN_TYPES.FINAL, pos: i, raw: input[i] };
            i++;
            state = 0;
          }
        }
      } else {
        const dataStart = i;
        while (i < len) {
          const charCode = input.charCodeAt(i);
          let terminator: string | undefined;

          if (charCode === ESC && input.charCodeAt(i + 1) === BACKSLASH) {
            terminator = ESC_CODE + BACKSLASH_CODE;
          } else if (charCode === ST) {
            terminator = ST_CODE;
          } else if (charCode === BELL && currentCode === OSC) {
            terminator = BELL_CODE;
          }

          if (terminator) {
            if (i > dataStart) yield { type: TOKEN_TYPES.DATA, pos, raw: input.substring(dataStart, i) };
            yield { type: TOKEN_TYPES.FINAL, pos: i, raw: terminator };
            i += terminator.length;
            state = 0;
            break;
          }

          if (isInterrupter(charCode)) {
            if (i > dataStart) yield { type: TOKEN_TYPES.DATA, pos, raw: input.substring(dataStart, i) };
            state = 0;
            if (isC0Interrupter(charCode)) {
              yield { type: TOKEN_TYPES.TEXT, pos: i, raw: input[i] };
              i++;
            }
            break;
          }

          i++;
        }
        if (state === 1 && i > dataStart) yield { type: TOKEN_TYPES.DATA, pos, raw: input.substring(dataStart, i) };
      }

      if (state === 1) state = 0;
    }
  }
}

export { tokenize } from "./tokenize.gen.ts";
