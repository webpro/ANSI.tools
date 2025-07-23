import {
  APC,
  BACKSLASH,
  BELL,
  C0_INTERRUPTERS,
  CSI,
  CSI_OPEN,
  DCS,
  ESC,
  INTERRUPTERS,
  OSC,
  OSC_OPEN,
  PM,
  SOS,
  ST,
  STRING_OPENERS,
  TOKEN_TYPES,
} from "./constants.ts";
import type { TOKEN } from "./types.ts";

type State = "GROUND" | "SEQUENCE";

const debug = false;

const INTRODUCERS = new Set([ESC, CSI, OSC, DCS, APC, PM, SOS]);

function emit(token: TOKEN) {
  if (debug) console.log("token", token);
  return token;
}

export function* tokenizer(input: string): Generator<TOKEN> {
  let i = 0;
  let state: State = "GROUND";
  let currentCode: string | undefined;

  function setState(next: State, code?: string) {
    if (debug) console.log(`state ${state} → ${next}`);
    state = next;
    currentCode = code;
  }

  while (i < input.length) {
    if (state === "GROUND") {
      const textStart = i;
      while (i < input.length) {
        const char = input[i];
        if (INTRODUCERS.has(char)) {
          break;
        }
        i++;
      }

      if (i > textStart) {
        yield emit({ type: TOKEN_TYPES.TEXT, pos: textStart, raw: input.substring(textStart, i) });
      }

      if (i < input.length) {
        const char = input[i];
        if (char === CSI || char === OSC || char === DCS || char === APC || char === PM || char === SOS) {
          yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: char, code: char });
          i++;
          setState("SEQUENCE", char);
        } else if (char === ESC) {
          const next = input[i + 1];
          if (next === CSI_OPEN) {
            yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: char + next, code: CSI });
            i += 2;
            setState("SEQUENCE", CSI);
          } else if (next === OSC_OPEN) {
            yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: char + next, code: OSC });
            i += 2;
            setState("SEQUENCE", OSC);
          } else if (STRING_OPENERS.has(next)) {
            yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: char + next, code: next });
            i += 2;
            setState("SEQUENCE", next);
          } else if (next) {
            let j = i + 1;
            while (j < input.length && input.charCodeAt(j) >= 0x20 && input.charCodeAt(j) <= 0x2f) j++;
            if (j < input.length) {
              const is = input.slice(i + 1, j);
              if (is) yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: char + is, code: ESC, intermediate: is });
              else yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: char, code: ESC });
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
          const char = input[i];
          if (INTERRUPTERS.has(char)) {
            if (data) yield emit({ type: TOKEN_TYPES.DATA, pos, raw: data });
            setState("GROUND");
            if (C0_INTERRUPTERS.has(char)) i++;
            break;
          }
          const charCode = char.charCodeAt(0);
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
          const char = input[i];
          if (INTERRUPTERS.has(char)) {
            setState("GROUND");
            if (C0_INTERRUPTERS.has(char)) i++;
          } else {
            yield emit({ type: TOKEN_TYPES.FINAL, pos: i, raw: char });
            i++;
            setState("GROUND");
          }
        }
      } else if (code) {
        while (i < input.length) {
          const char = input[i];
          let terminator: string | undefined;

          if (char === ESC && input[i + 1] === BACKSLASH) {
            terminator = ESC + BACKSLASH;
          } else if (char === ST) {
            terminator = ST;
          } else if (char === BELL && code === OSC) {
            terminator = BELL;
          }

          if (terminator) {
            if (data) yield emit({ type: TOKEN_TYPES.DATA, pos, raw: data });
            yield emit({ type: TOKEN_TYPES.FINAL, pos: i, raw: terminator });
            i += terminator.length;
            setState("GROUND");
            break;
          }

          if (INTERRUPTERS.has(char)) {
            if (data) yield emit({ type: TOKEN_TYPES.DATA, pos, raw: data });
            setState("GROUND");
            if (C0_INTERRUPTERS.has(char)) i++;
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
