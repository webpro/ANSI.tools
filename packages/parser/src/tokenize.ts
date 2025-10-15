import {
  APC,
  BACKSLASH,
  BACKSLASH_CODE,
  BELL,
  BELL_CODE,
  C0_INTERRUPTERS,
  CSI,
  CSI_CODE,
  CSI_OPEN,
  DCS,
  ESC,
  ESC_CODE,
  INTERRUPTERS,
  OSC,
  OSC_CODE,
  OSC_OPEN,
  PM,
  SOS,
  ST,
  ST_CODE,
  STRING_OPENERS,
  TOKEN_TYPES,
} from "./constants.ts";
import type { TOKEN } from "./types.ts";

type State = "GROUND" | "SEQUENCE";

const debug = false;

function emit(token: TOKEN) {
  if (debug) console.log("token", token);
  return token;
}

export function* tokenizer(input: string): IterableIterator<TOKEN> {
  let i = 0;
  let state: State = "GROUND";
  let currentCode: number | undefined;

  function setState(next: State, code?: number) {
    if (debug) console.log(`state ${state} → ${next}`);
    state = next;
    currentCode = code;
  }

  while (i < input.length) {
    if (state === "GROUND") {
      const textStart = i;
      let charCode = input.charCodeAt(i);
      let char = input[i];

      while (i < input.length) {
        if (
          charCode === ESC ||
          charCode === CSI ||
          charCode === OSC ||
          charCode === DCS ||
          charCode === APC ||
          charCode === PM ||
          charCode === SOS
        ) {
          break;
        }
        i++;
        charCode = input.charCodeAt(i);
        char = input[i];
      }

      if (i > textStart) {
        yield emit({ type: TOKEN_TYPES.TEXT, pos: textStart, raw: input.substring(textStart, i) });
      }

      if (i < input.length) {
        if (
          charCode === CSI ||
          charCode === OSC ||
          charCode === DCS ||
          charCode === APC ||
          charCode === PM ||
          charCode === SOS
        ) {
          yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: char, code: char });
          i++;
          setState("SEQUENCE", charCode);
        } else if (charCode === ESC) {
          const next = input[i + 1];
          const nextCode = input.charCodeAt(i + 1);
          if (nextCode === CSI_OPEN) {
            yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: char + next, code: CSI_CODE });
            i += 2;
            setState("SEQUENCE", CSI);
          } else if (nextCode === OSC_OPEN) {
            yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: char + next, code: OSC_CODE });
            i += 2;
            setState("SEQUENCE", OSC);
          } else if (STRING_OPENERS.has(next)) {
            yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: char + next, code: next });
            i += 2;
            setState("SEQUENCE", nextCode);
          } else if (next) {
            let j = i + 1;
            while (j < input.length && input.charCodeAt(j) >= 0x20 && input.charCodeAt(j) <= 0x2f) j++;
            if (j < input.length) {
              const is = input.slice(i + 1, j);
              if (is)
                yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: char + is, code: ESC_CODE, intermediate: is });
              else yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: char, code: ESC_CODE });
              i = j;
              setState("SEQUENCE", ESC);
            } else {
              i = j;
            }
          } else {
            i++;
          }
        }
      }
    } else if (state === "SEQUENCE") {
      const pos = i;
      const code = currentCode;
      let data = "";

      if (code === CSI) {
        while (i < input.length) {
          const charCode = input.charCodeAt(i);
          const char = input[i];
          if (INTERRUPTERS.has(charCode)) {
            if (data) yield emit({ type: TOKEN_TYPES.DATA, pos, raw: data });
            setState("GROUND");
            if (C0_INTERRUPTERS.has(charCode)) i++;
            break;
          }
          if (charCode >= 0x40 && charCode <= 0x7e) {
            if (data) yield emit({ type: TOKEN_TYPES.DATA, pos, raw: data });
            yield emit({ type: TOKEN_TYPES.FINAL, pos: i, raw: char });
            i++;
            setState("GROUND");
            break;
          }
          data += char;
          i++;
        }
      } else if (code === ESC) {
        if (i < input.length) {
          const charCode = input.charCodeAt(i);
          const char = input[i];
          if (INTERRUPTERS.has(charCode)) {
            setState("GROUND");
            if (C0_INTERRUPTERS.has(charCode)) i++;
          } else {
            yield emit({ type: TOKEN_TYPES.FINAL, pos: i, raw: char });
            i++;
            setState("GROUND");
          }
        }
      } else if (code) {
        while (i < input.length) {
          const char = input[i];
          const charCode = char.charCodeAt(0);
          let terminator: string | undefined;

          if (charCode === ESC && input.charCodeAt(i + 1) === BACKSLASH) {
            terminator = ESC_CODE + BACKSLASH_CODE;
          } else if (charCode === ST) {
            terminator = ST_CODE;
          } else if (charCode === BELL && code === OSC) {
            terminator = BELL_CODE;
          }

          if (terminator) {
            if (data) yield emit({ type: TOKEN_TYPES.DATA, pos, raw: data });
            yield emit({ type: TOKEN_TYPES.FINAL, pos: i, raw: terminator });
            i += terminator.length;
            setState("GROUND");
            break;
          }

          if (INTERRUPTERS.has(charCode)) {
            if (data) yield emit({ type: TOKEN_TYPES.DATA, pos, raw: data });
            setState("GROUND");
            if (C0_INTERRUPTERS.has(charCode)) i++;
            break;
          }

          data += char;
          i++;
        }
      }

      if (state === "SEQUENCE") setState("GROUND");
    }
  }
}

export function tokenize(input: string): TOKEN[] {
  return Array.from(tokenizer(input));
}
