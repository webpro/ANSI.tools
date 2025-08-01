import {
  APC_OPEN,
  APC,
  CODE_TYPES,
  CSI,
  DCS_OPEN,
  DCS,
  ESC,
  OSC,
  PM_OPEN,
  PM,
  SOS_OPEN,
  SOS,
  TOKEN_TYPES,
} from "./constants.ts";
import { parseCSI } from "./parsers/csi.ts";
import { parseDCS } from "./parsers/dcs.ts";
import { parseESC } from "./parsers/esc.ts";
import { parseOSC } from "./parsers/osc.ts";
import { parseAPC } from "./parsers/apc.ts";
import { parsePM } from "./parsers/pm.ts";
import { parseSOS } from "./parsers/sos.ts";
import { tokenizer } from "./tokenize.ts";
import type { CODE, TOKEN } from "./types.ts";

const debug = false;

function emit(token: CODE) {
  if (debug) console.log("code", token);
  return token;
}

export function* parser(tokens: IterableIterator<TOKEN>): IterableIterator<CODE> {
  let current = tokens.next();

  while (!current.done) {
    const token = current.value;

    if (token.type === TOKEN_TYPES.TEXT) {
      yield emit({ type: CODE_TYPES.TEXT, pos: token.pos, raw: token.raw });
      current = tokens.next();
      continue;
    }

    if (token.type === TOKEN_TYPES.INTRODUCER) {
      const introducer = token;
      const data: TOKEN[] = [];
      let final: TOKEN | undefined;

      current = tokens.next();

      while (!current.done) {
        const nextToken = current.value;
        if (nextToken.type === TOKEN_TYPES.DATA) {
          data.push(nextToken);
        } else if (nextToken.type === TOKEN_TYPES.FINAL) {
          final = nextToken;
          current = tokens.next();
          break;
        } else if (nextToken.type === TOKEN_TYPES.INTRODUCER) {
          break;
        } else if (nextToken.type === TOKEN_TYPES.TEXT) {
          break;
        }
        current = tokens.next();
      }

      switch (introducer.code) {
        case CSI:
          yield emit(parseCSI(introducer, data, final));
          break;
        case OSC:
          yield emit(parseOSC(introducer, data, final));
          break;
        case DCS:
        case DCS_OPEN:
          yield emit(parseDCS(introducer, data, final));
          break;
        case APC:
        case APC_OPEN:
          yield emit(parseAPC(introducer, data, final));
          break;
        case PM:
        case PM_OPEN:
          yield emit(parsePM(introducer, data, final));
          break;
        case SOS:
        case SOS_OPEN:
          yield emit(parseSOS(introducer, data, final));
          break;
        case ESC:
          yield emit(parseESC(introducer, data, final));
          break;
      }
    } else {
      current = tokens.next();
    }
  }
}

export function parse(input: string): CODE[] {
  return Array.from(parser(tokenizer(input)));
}
