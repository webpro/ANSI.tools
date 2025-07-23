import { BACKSLASH, CSI, CSI_OPEN, ESC, OSC, OSC_OPEN, STRING_OPENERS, TOKEN_TYPES } from "./constants.ts";
import type { TOKEN } from "./types.ts";

type State = "GROUND" | "SEQUENCE";

const debug = false;

const CSI_ESCAPED = "\\u009b";
const CSI_ESCAPED_HEX = "\\x9b";
const ABANDONED = "ABANDONED";

const INTRODUCERS = [
  ["\\u001b", 6],
  [CSI_ESCAPED, 6],
  [CSI_ESCAPED_HEX, 4],
  ["\\x1b", 4],
  ["\\033", 4],
  ["\\e", 2],
] as const;

const INTERRUPTERS_ESCAPED = [
  ["\\x18", 4],
  ["\\x1a", 4],
  ["\\u0018", 6],
  ["\\u001a", 6],
] as const;

const INTERRUPTER_LOOKUP = new Map<string, [string, number][]>();
for (const [sequence, len] of INTERRUPTERS_ESCAPED) {
  const secondChar = sequence[1];
  if (!INTERRUPTER_LOOKUP.has(secondChar)) INTERRUPTER_LOOKUP.set(secondChar, []);
  INTERRUPTER_LOOKUP.get(secondChar)?.push([sequence, len]);
}

const INTRODUCER_LOOKUP = new Map<string, [string, number][]>();
const INTRODUCER_FIRST_CHAR_CACHE = new Map<string, boolean>();

for (const [sequence, len] of INTRODUCERS) {
  const secondChar = sequence[1];
  if (!INTRODUCER_LOOKUP.has(secondChar)) INTRODUCER_LOOKUP.set(secondChar, []);
  INTRODUCER_LOOKUP.get(secondChar)?.push([sequence, len]);
  INTRODUCER_FIRST_CHAR_CACHE.set(sequence, true);
}

function emit(token: TOKEN) {
  if (debug) console.log("token", token);
  return token;
}

export function* tokenizer(input: string): Generator<TOKEN> {
  const l = input.length;
  let i = 0;
  let state: State = "GROUND";
  let currentCode: string | undefined;

  function setState(next: State, code?: string) {
    if (debug) console.log(`state ${state} → ${next}`);
    state = next;
    currentCode = code;
  }

  while (i < l) {
    if (state === "GROUND") {
      const textStart = i;
      while (i < l) {
        const backslashIndex = input.indexOf(BACKSLASH, i);

        if (backslashIndex === -1) {
          i = l;
          break;
        }

        let isIntroducer = false;
        const candidates = INTRODUCER_LOOKUP.get(input[backslashIndex + 1]);
        if (candidates) {
          for (const [seq, len] of candidates) {
            if (backslashIndex + len > l) continue;
            let matched = true;
            for (let k = 0; k < len && matched; k += 2) {
              matched = input[backslashIndex + k] === seq[k];
              if (matched && k + 1 < len) {
                matched = input[backslashIndex + k + 1] === seq[k + 1];
              }
            }
            if (matched) {
              isIntroducer = true;
              break;
            }
          }
        }

        if (isIntroducer) {
          i = backslashIndex;
          break;
        } else {
          i = backslashIndex + 1;
        }
      }

      if (i > textStart) {
        yield emit({ type: TOKEN_TYPES.TEXT, pos: textStart, raw: input.substring(textStart, i) });
      }

      if (i < l) {
        const candidates = INTRODUCER_LOOKUP.get(input[i + 1]);
        if (candidates) {
          let isMatch = false;
          for (const [seq, len] of candidates) {
            if (i + len > l) continue;
            let isSeqMatch = true;
            for (let k = 0; k < len && isSeqMatch; k += 2) {
              isSeqMatch = input[i + k] === seq[k];
              if (isSeqMatch && k + 1 < len) {
                isSeqMatch = input[i + k + 1] === seq[k + 1];
              }
            }

            if (isSeqMatch) {
              isMatch = true;
              if (seq === CSI_ESCAPED || seq === CSI_ESCAPED_HEX) {
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
                } else if (next) {
                  let j = i + len;
                  while (j < l && input.charCodeAt(j) >= 0x20 && input.charCodeAt(j) <= 0x2f) j++;
                  if (j < l) {
                    const is = input.slice(i + len, j);
                    if (is)
                      yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: seq + is, code: ESC, intermediate: is });
                    else yield emit({ type: TOKEN_TYPES.INTRODUCER, pos: i, raw: seq, code: ESC });
                    i = j;
                    setState("SEQUENCE", ESC);
                  } else {
                    i = j;
                  }
                } else {
                  i += len;
                }
              }
              break;
            }
          }
          if (!isMatch) {
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

      while (!terminator && i < l) {
        const char = input[i];
        if (char === BACKSLASH) {
          const next = input[i + 1];
          if (next) {
            const interrupters = INTERRUPTER_LOOKUP.get(next);
            if (interrupters) {
              for (const [seq, len] of interrupters) {
                if (i + len <= l) {
                  let matched = true;
                  for (let k = 0; k < len; k++) {
                    if (input[i + k] !== seq[k]) {
                      matched = false;
                      break;
                    }
                  }
                  if (matched) {
                    terminator = ABANDONED;
                    terminatorPos = i;
                    i += len;
                    break;
                  }
                }
              }
            }
          }
          if (terminator) break;

          if (code !== CSI && code !== ESC) {
            if (next === "a" && i + 2 <= l) {
              if (code === OSC && input[i + 1] === "a") {
                terminator = "\\a";
                terminatorPos = i;
                i += 2;
              }
            } else if (next === "x") {
              if (i + 4 <= l) {
                const char3 = input[i + 2];
                const char4 = input[i + 3];
                if (char3 === "0" && char4 === "7" && code === OSC) {
                  terminator = "\\x07";
                  terminatorPos = i;
                  i += 4;
                } else if (char3 === "9" && char4 === "c") {
                  terminator = "\\x9c";
                  terminatorPos = i;
                  i += 4;
                } else if (
                  char3 === "1" &&
                  char4 === "b" &&
                  i + 6 <= l &&
                  input[i + 4] === BACKSLASH &&
                  input[i + 5] === BACKSLASH
                ) {
                  terminator = "\\x1b\\\\";
                  terminatorPos = i;
                  i += 6;
                }
              }
            } else if (next === "u" && code === OSC && i + 6 <= l) {
              if (input[i + 2] === "0" && input[i + 3] === "0" && input[i + 4] === "0" && input[i + 5] === "7") {
                terminator = "\\u0007";
                terminatorPos = i;
                i += 6;
              }
            } else if (next === "e" && i + 4 <= l) {
              if (input[i + 2] === BACKSLASH && input[i + 3] === BACKSLASH) {
                terminator = "\\e\\\\";
                terminatorPos = i;
                i += 4;
              }
            }
          }

          if (!terminator) {
            if (next) {
              const candidates = INTRODUCER_LOOKUP.get(next);
              if (candidates) {
                for (const [seq, len] of candidates) {
                  if (i + len > l) continue;
                  let matched = true;
                  for (let k = 0; k < len && matched; k += 2) {
                    matched = input[i + k] === seq[k];
                    if (matched && k + 1 < len) {
                      matched = input[i + k + 1] === seq[k + 1];
                    }
                  }
                  if (matched) {
                    terminator = ABANDONED;
                    terminatorPos = i;
                    break;
                  }
                }
              }
            }
          }
        } else if (code === CSI) {
          const charCode = input.charCodeAt(i);
          if (charCode >= 0x40 && charCode <= 0x7e) {
            terminator = char;
            terminatorPos = i;
            i++;
          }
        } else if (code === ESC) {
          terminator = char;
          terminatorPos = i;
          i++;
        }

        if (!terminator) {
          i++;
        }
      }

      if (terminatorPos > pos) {
        const data = input.substring(pos, terminatorPos);
        yield emit({ type: TOKEN_TYPES.DATA, pos, raw: data });
      }

      if (terminator && terminator !== ABANDONED) {
        yield emit({ type: TOKEN_TYPES.FINAL, pos: terminatorPos, raw: terminator });
      }

      setState("GROUND");
    }
  }
}

export function tokenize(input: string): TOKEN[] {
  return Array.from(tokenizer(input));
}
