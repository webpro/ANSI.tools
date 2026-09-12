import {
  BACKSLASH,
  BACKSLASH_CODE,
  CSI,
  CSI_CODE,
  CSI_OPEN_CODE,
  ESC,
  ESC_CODE,
  OSC,
  OSC_CODE,
  OSC_OPEN_CODE,
  STRING_OPENERS,
  TOKEN_TYPES,
} from "./constants.ts";
import type { TOKEN } from "./types.ts";
import {
  ABANDONED,
  CSI_ESCAPED,
  CSI_ESCAPED_HEX,
  INTERRUPTER_LOOKUP,
  INTRODUCER_LOOKUP,
  nulLength,
  startsTerminator,
  STRING_TERMINATORS,
  type State,
} from "./tokenize.escaped.shared.ts";

export function* tokenizer(input: string): IterableIterator<TOKEN> {
  const l = input.length;
  let i = 0;
  let state: State = "GROUND";
  let currentCode: number | undefined;
  let backslashIndex = input.indexOf(BACKSLASH_CODE);

  while (i < l) {
    if (state === "GROUND") {
      const textStart = i;
      while (i < l) {
        if (backslashIndex === -1) {
          i = l;
          break;
        }

        if (backslashIndex < i) {
          backslashIndex = input.indexOf(BACKSLASH_CODE, i);
        }

        if (backslashIndex === -1) {
          i = l;
          break;
        }

        let isIntroducer = false;
        const candidates = INTRODUCER_LOOKUP.get(input[backslashIndex + 1]);
        if (candidates) {
          for (const [seq, len] of candidates) {
            if (backslashIndex + len > l) continue;
            const matched = input.startsWith(seq, backslashIndex);
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
        yield { type: TOKEN_TYPES.TEXT, pos: textStart, raw: input.substring(textStart, i) };
      }

      if (i < l) {
        const candidates = INTRODUCER_LOOKUP.get(input[i + 1]);
        if (candidates) {
          let isMatch = false;
          for (const [seq, len] of candidates) {
            if (i + len > l) continue;
            const isSeqMatch = input.startsWith(seq, i);

            if (isSeqMatch) {
              isMatch = true;
              if (seq === CSI_ESCAPED || seq === CSI_ESCAPED_HEX) {
                yield { type: TOKEN_TYPES.INTRODUCER, pos: i, raw: seq, code: CSI_CODE };
                i += len;
                state = "SEQUENCE";
                currentCode = CSI;
              } else {
                let nextPos = i + len;
                let ignored = nulLength(input, nextPos);
                while (ignored) {
                  nextPos += ignored;
                  ignored = nulLength(input, nextPos);
                }
                const next = input[nextPos];
                if (next === CSI_OPEN_CODE) {
                  yield { type: TOKEN_TYPES.INTRODUCER, pos: i, raw: input.substring(i, nextPos + 1), code: CSI_CODE };
                  i = nextPos + 1;
                  state = "SEQUENCE";
                  currentCode = CSI;
                } else if (next === OSC_OPEN_CODE) {
                  yield { type: TOKEN_TYPES.INTRODUCER, pos: i, raw: input.substring(i, nextPos + 1), code: OSC_CODE };
                  i = nextPos + 1;
                  state = "SEQUENCE";
                  currentCode = OSC;
                } else if (STRING_OPENERS.has(next)) {
                  yield { type: TOKEN_TYPES.INTRODUCER, pos: i, raw: input.substring(i, nextPos + 1), code: next };
                  i = nextPos + 1;
                  state = "SEQUENCE";
                  currentCode = next.charCodeAt(0);
                } else if (next) {
                  let j = nextPos;
                  let is = "";
                  while (j < l) {
                    const ignored = nulLength(input, j);
                    if (ignored) j += ignored;
                    else if (input.charCodeAt(j) >= 0x20 && input.charCodeAt(j) <= 0x2f) is += input[j++];
                    else break;
                  }
                  if (is)
                    yield {
                      type: TOKEN_TYPES.INTRODUCER,
                      pos: i,
                      raw: input.substring(i, j),
                      code: ESC_CODE,
                      intermediate: is,
                    };
                  else yield { type: TOKEN_TYPES.INTRODUCER, pos: i, raw: input.substring(i, j), code: ESC_CODE };
                  i = j;
                  if (j < l) {
                    state = "SEQUENCE";
                    currentCode = ESC;
                  }
                } else {
                  yield { type: TOKEN_TYPES.INTRODUCER, pos: i, raw: input.substring(i, nextPos), code: ESC_CODE };
                  i = nextPos;
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
      let finalCode: string | undefined;
      let terminatorPos = -1;
      let abandoned = "";
      let pos = i;

      while (!terminator && i < l) {
        const charCode = input.charCodeAt(i);
        if (currentCode === CSI && (charCode === 0 || charCode === BACKSLASH)) {
          const ignored = nulLength(input, i);
          if (ignored) {
            if (i > pos) yield { type: TOKEN_TYPES.DATA, pos, raw: input.substring(pos, i) };
            yield { type: TOKEN_TYPES.DATA, pos: i, raw: input.substring(i, i + ignored), code: "" };
            i += ignored;
            pos = i;
            continue;
          }
        }
        if (charCode === BACKSLASH) {
          const next = input[i + 1];
          if (currentCode === ESC && next === BACKSLASH_CODE) {
            terminator = input.substring(i, i + 2);
            finalCode = BACKSLASH_CODE;
            terminatorPos = i;
            i += 2;
            break;
          }
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
                    abandoned = input.substring(i, i + len);
                    i += len;
                    break;
                  }
                }
              }
            }
          }
          if (terminator) break;

          if (currentCode !== CSI && currentCode !== ESC && startsTerminator(next)) {
            for (const candidate of STRING_TERMINATORS) {
              if (input.startsWith(candidate, i)) {
                terminator = candidate;
                break;
              }
            }
            if (!terminator && currentCode === OSC) {
              if (input.startsWith("\\a", i)) terminator = "\\a";
              else if (input.startsWith("\\x07", i)) terminator = "\\x07";
              else if (input.startsWith("\\u0007", i)) terminator = "\\u0007";
            }
            if (terminator) {
              terminatorPos = i;
              i += terminator.length;
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
        } else if (currentCode === CSI) {
          if (charCode >= 0x40 && charCode <= 0x7e) {
            terminator = input[i];
            terminatorPos = i;
            i++;
          }
        } else if (currentCode === ESC) {
          terminator = input[i];
          terminatorPos = i;
          i++;
        }

        if (!terminator) {
          i++;
        }
      }

      if (terminatorPos > pos) {
        yield { type: TOKEN_TYPES.DATA, pos, raw: input.substring(pos, terminatorPos) };
      } else if (!terminator && i > pos) {
        yield { type: TOKEN_TYPES.DATA, pos, raw: input.substring(pos, i) };
      }

      if (terminator && terminator !== ABANDONED) {
        if (finalCode !== undefined)
          yield { type: TOKEN_TYPES.FINAL, pos: terminatorPos, raw: terminator, code: finalCode };
        else yield { type: TOKEN_TYPES.FINAL, pos: terminatorPos, raw: terminator };
      }

      if (abandoned) yield { type: TOKEN_TYPES.TEXT, pos: terminatorPos, raw: abandoned };

      state = "GROUND";
      currentCode = undefined;
    }
  }
}

export { tokenize } from "./tokenize.escaped.gen.ts";
