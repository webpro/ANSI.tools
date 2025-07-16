import { BACKSLASH, CSI, CSI_OPEN, ESC, OSC, OSC_OPEN, STRING_OPENERS, TOKEN_TYPES } from "./constants.ts";
import type { TOKEN } from "./types.ts";

type State = "GROUND" | "SEQUENCE";

const debug = false;

const CSI_ESCAPED = "\\u009b";

const INTRODUCERS = [
  ["\\u001b", 6],
  [CSI_ESCAPED, 6],
  ["\\x1b", 4],
  ["\\033", 4],
  ["\\e", 2],
] as const;

const INTRODUCER_LOOKUP = new Map<string, [string, number][]>();
for (const [sequence, len] of INTRODUCERS) {
  const secondChar = sequence[1];
  if (!INTRODUCER_LOOKUP.has(secondChar)) INTRODUCER_LOOKUP.set(secondChar, []);
  INTRODUCER_LOOKUP.get(secondChar)?.push([sequence, len]);
}

const STRING_TERMINATORS = new Map([
  ["\\x9c", 4],
  ["\\e\\\\", 4],
  ["\\x1b\\\\", 8],
]);

const OSC_ONLY_TERMINATORS = new Map([
  ["\\a", 2],
  ["\\x07", 4],
  ["\\u0007", 6],
]);

const ST_MAX_LENGTH = Math.max(...STRING_TERMINATORS.values());
const OSC_TERM_MAX_LENGTH = Math.max(...OSC_ONLY_TERMINATORS.values());
const INTRODUCER_PEEK_AHEAD = new Set(INTRODUCERS.map(entry => entry[0][1]));

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
        const backslashIndex = input.indexOf(BACKSLASH, i);

        if (backslashIndex === -1) {
          i = input.length;
          break;
        }

        const nextChar = input[backslashIndex + 1];
        if (nextChar && INTRODUCER_PEEK_AHEAD.has(nextChar)) {
          i = backslashIndex;
          break;
        } else {
          i = backslashIndex + 1;
        }
      }

      if (i > textStart) {
        yield emit({ type: TOKEN_TYPES.TEXT, pos: textStart, raw: input.substring(textStart, i) });
      }

      if (i < input.length) {
        const candidates = INTRODUCER_LOOKUP.get(input[i + 1]);
        if (candidates) {
          let matched = false;
          for (const [seq, len] of candidates) {
            if (i + len <= input.length && input.substring(i, i + len) === seq) {
              matched = true;
              if (seq === CSI_ESCAPED) {
                yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: seq, code: CSI });
                i += len;
                setState("SEQUENCE", CSI);
              } else {
                const next = input[i + len];
                if (next === CSI_OPEN) {
                  yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: seq + next, code: CSI });
                  i += len + 1;
                  setState("SEQUENCE", CSI);
                } else if (next === OSC_OPEN) {
                  yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: seq + next, code: OSC });
                  i += len + 1;
                  setState("SEQUENCE", OSC);
                } else if (STRING_OPENERS.has(next)) {
                  yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: seq + next, code: next });
                  i += len + 1;
                  setState("SEQUENCE", next);
                } else if (next && next.charCodeAt(0) >= 0x20 && next.charCodeAt(0) <= 0x2f) {
                  yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: seq + next, code: ESC, intermediate: next });
                  i += len + 1;
                  setState("SEQUENCE", ESC);
                } else if (next) {
                  yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: seq, code: ESC });
                  i += len;
                  setState("SEQUENCE", ESC);
                } else {
                  i += len;
                }
              }
              break;
            }
          }
          if (!matched) {
            i++;
          }
        } else {
          i++;
        }
      }
    } else if (state === "SEQUENCE") {
      let terminator = "";
      let terminatorPos = -1;
      const pos = i;
      const code = currentCode;

      while (!terminator && i < input.length) {
        const char = input[i];
        if (code === CSI) {
          const charCode = input.charCodeAt(i);
          if (charCode >= 0x40 && charCode < 0x7e) {
            terminator = char;
            terminatorPos = i;
            i++;
          }
        } else if (code === ESC) {
          terminator = char;
          terminatorPos = i;
          i++;
        } else if (code) {
          if (char === BACKSLASH) {
            if (code === OSC) {
              for (let len = OSC_TERM_MAX_LENGTH; len >= 2; len -= 2) {
                if (i + len <= input.length) {
                  const sequence = input.substring(i, i + len);
                  if (OSC_ONLY_TERMINATORS.has(sequence)) {
                    terminator = sequence;
                    terminatorPos = i;
                    i += len;
                    break;
                  }
                }
              }
            }
            if (!terminator) {
              for (let len = ST_MAX_LENGTH; len >= 2; len -= 2) {
                if (i + len <= input.length) {
                  const sequence = input.substring(i, i + len);
                  if (STRING_TERMINATORS.has(sequence)) {
                    terminator = sequence;
                    terminatorPos = i;
                    i += len;
                    break;
                  }
                }
              }
            }
          }
        }

        if (!terminator) {
          i++;
        }
      }

      if (terminatorPos > pos) {
        const data = input.substring(pos, terminatorPos);
        yield emit({ type: TOKEN_TYPES.DATA, pos, raw: data });
      }

      if (terminator) {
        yield emit({ type: TOKEN_TYPES.FINAL, pos: terminatorPos, raw: terminator });
      }

      setState("GROUND");
    }
  }
}

export function tokenize(input: string): TOKEN[] {
  return Array.from(tokenizer(input));
}
