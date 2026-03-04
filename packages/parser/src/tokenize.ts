import {
  APC,
  BACKSLASH,
  BACKSLASH_CODE,
  BELL,
  BELL_CODE,
  CAN,
  CSI,
  CSI_CODE,
  CSI_OPEN,
  DCS,
  ESC,
  ESC_CODE,
  OSC,
  OSC_CODE,
  OSC_OPEN,
  PM,
  SOS,
  ST,
  ST_CODE,
  STRING_OPENERS,
  SUB,
  TOKEN_TYPES,
} from "./constants.ts";
import type { TOKEN } from "./types.ts";

function isInterrupter(c: number): boolean {
  return (
    c === CAN || c === SUB || c === ESC || c === CSI || c === OSC || c === DCS || c === APC || c === PM || c === SOS
  );
}

function isC0Interrupter(c: number): boolean {
  return c === CAN || c === SUB;
}

function isSequenceStart(c: number): boolean {
  return c === ESC || c === CSI || c === OSC || c === DCS || c === APC || c === PM || c === SOS;
}

function is8BitIntroducer(c: number): boolean {
  return c === CSI || c === OSC || c === DCS || c === APC || c === PM || c === SOS;
}

export function* tokenizer(input: string): IterableIterator<TOKEN> {
  let i = 0;
  let state = 0; // 0 = GROUND, 1 = SEQUENCE
  let currentCode = 0;
  const len = input.length;

  while (i < len) {
    if (state === 0) {
      const textStart = i;
      let charCode = input.charCodeAt(i);

      while (i < len && !isSequenceStart(charCode)) {
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
        const nextCode = input.charCodeAt(i + 1);
        if (nextCode === CSI_OPEN) {
          yield { type: TOKEN_TYPES.INTRODUCER, pos: i, raw: input.substring(i, i + 2), code: CSI_CODE };
          i += 2;
          state = 1;
          currentCode = CSI;
        } else if (nextCode === OSC_OPEN) {
          yield { type: TOKEN_TYPES.INTRODUCER, pos: i, raw: input.substring(i, i + 2), code: OSC_CODE };
          i += 2;
          state = 1;
          currentCode = OSC;
        } else if (i + 1 < len && STRING_OPENERS.has(input[i + 1])) {
          yield { type: TOKEN_TYPES.INTRODUCER, pos: i, raw: input.substring(i, i + 2), code: input[i + 1] };
          i += 2;
          state = 1;
          currentCode = nextCode;
        } else if (i + 1 < len) {
          let j = i + 1;
          while (j < len && input.charCodeAt(j) >= 0x20 && input.charCodeAt(j) <= 0x2f) j++;
          if (j < len) {
            if (j > i + 1) {
              const intermediate = input.substring(i + 1, j);
              yield { type: TOKEN_TYPES.INTRODUCER, pos: i, raw: input.substring(i, j), code: ESC_CODE, intermediate };
            } else {
              yield { type: TOKEN_TYPES.INTRODUCER, pos: i, raw: input[i], code: ESC_CODE };
            }
            i = j;
            state = 1;
            currentCode = ESC;
          } else {
            i = j;
          }
        } else {
          i++;
        }
      }
    } else {
      const pos = i;

      if (currentCode === CSI) {
        const dataStart = i;
        while (i < len) {
          const charCode = input.charCodeAt(i);
          if (isInterrupter(charCode)) {
            if (i > dataStart) yield { type: TOKEN_TYPES.DATA, pos, raw: input.substring(dataStart, i) };
            state = 0;
            if (isC0Interrupter(charCode)) i++;
            break;
          }
          if (charCode >= 0x40 && charCode <= 0x7e) {
            if (i > dataStart) yield { type: TOKEN_TYPES.DATA, pos, raw: input.substring(dataStart, i) };
            yield { type: TOKEN_TYPES.FINAL, pos: i, raw: input[i] };
            i++;
            state = 0;
            break;
          }
          i++;
        }
      } else if (currentCode === ESC) {
        if (i < len) {
          const charCode = input.charCodeAt(i);
          if (isInterrupter(charCode)) {
            state = 0;
            if (isC0Interrupter(charCode)) i++;
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
            if (isC0Interrupter(charCode)) i++;
            break;
          }

          i++;
        }
      }

      if (state === 1) state = 0;
    }
  }
}

export function tokenize(input: string): TOKEN[] {
  const result: TOKEN[] = [];
  for (const token of tokenizer(input)) result.push(token);
  return result;
}
