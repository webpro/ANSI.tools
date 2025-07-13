import {
  APC_OPEN,
  APC,
  CODE_TYPES,
  CSI,
  DCS_OPEN,
  DCS,
  DEC_OPEN,
  ESC,
  OSC,
  PM_OPEN,
  PM,
  PRIVATE_OPENERS,
  SOS_OPEN,
  SOS,
  TOKEN_TYPES,
} from "./constants.ts";
import { parseCSI, parsePrivateCSI } from "./parsers/csi.ts";
import { parseDCS } from "./parsers/dcs.ts";
import { parseDEC } from "./parsers/dec.ts";
import { parseESC } from "./parsers/esc.ts";
import { parseOSC } from "./parsers/osc.ts";
import { tokenizer } from "./tokenize.ts";
import type { CODE, TOKEN } from "./types.ts";

const debug = false;

function emit(token: CODE) {
  if (debug) console.log("code", token);
  return token;
}

export function* parser(tokens: Generator<TOKEN>): Generator<CODE> {
  let current = tokens.next();

  while (!current.done) {
    const token = current.value;

    if (token.type === TOKEN_TYPES.TEXT) {
      yield emit({ type: CODE_TYPES.TEXT, pos: token.pos, raw: token.raw });
      current = tokens.next();
      continue;
    }

    if (token.type === TOKEN_TYPES.INTRODUCER) {
      const pos = token.pos;
      let raw = token.raw;
      let data = "";
      let finalToken: TOKEN | undefined;

      current = tokens.next();

      while (!current.done && !finalToken) {
        const nextToken = current.value;

        if (nextToken.type === TOKEN_TYPES.DATA) {
          data += nextToken.raw;
          raw += nextToken.raw;
        } else if (nextToken.type === TOKEN_TYPES.FINAL) {
          finalToken = nextToken;
          raw += nextToken.raw;
        }
        current = tokens.next();
      }

      if (finalToken) {
        switch (token.code) {
          case CSI:
            if (data.startsWith(DEC_OPEN)) {
              yield emit(parseDEC(pos, raw, data, finalToken.raw));
            } else if (PRIVATE_OPENERS.has(data[0])) {
              yield emit(parsePrivateCSI(pos, raw, data, finalToken.raw));
            } else {
              yield emit(parseCSI(pos, raw, data, finalToken.raw));
            }
            break;
          case OSC:
            yield emit(parseOSC(pos, raw, data));
            break;
          case DCS:
          case DCS_OPEN:
            yield emit(parseDCS(pos, raw, data));
            break;
          case APC:
          case APC_OPEN:
            yield emit({ type: CODE_TYPES.STRING, pos, raw, command: "APC", params: data ? [data] : [] });
            break;
          case PM:
          case PM_OPEN:
            yield emit({ type: CODE_TYPES.STRING, pos, raw, command: "PM", params: data ? [data] : [] });
            break;
          case SOS:
          case SOS_OPEN:
            yield emit({ type: CODE_TYPES.STRING, pos, raw, command: "SOS", params: data ? [data] : [] });
            break;
          case ESC:
            yield emit(parseESC(token, raw, finalToken.raw, data));
            break;
        }
      } else if (token.code === ESC) {
        yield emit(parseESC(token, raw, "", ""));
      }
    } else {
      current = tokens.next();
    }
  }
}

export function parse(input: string): CODE[] {
  return Array.from(parser(tokenizer(input)));
}
