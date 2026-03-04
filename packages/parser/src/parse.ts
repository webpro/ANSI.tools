import {
  APC_CODE,
  APC_OPEN,
  CODE_TYPES,
  CSI_CODE,
  DCS_CODE,
  DCS_OPEN,
  ESC_CODE,
  OSC_CODE,
  PM_CODE,
  PM_OPEN,
  SOS_CODE,
  SOS_OPEN,
  TOKEN_TYPES,
} from "./constants.ts";
import { parseAPC } from "./parsers/apc.ts";
import { parseCSI } from "./parsers/csi.ts";
import { parseDCS } from "./parsers/dcs.ts";
import { parseESC } from "./parsers/esc.ts";
import { parseOSC } from "./parsers/osc.ts";
import { parsePM } from "./parsers/pm.ts";
import { parseSOS } from "./parsers/sos.ts";
import { tokenize } from "./tokenize.ts";
import { tokenizer } from "./tokenize.ts";
import type { CODE, TOKEN } from "./types.ts";

export function* parser(tokens: IterableIterator<TOKEN>): IterableIterator<CODE> {
  let current = tokens.next();

  while (!current.done) {
    const token = current.value;

    if (token.type === TOKEN_TYPES.TEXT) {
      yield { type: CODE_TYPES.TEXT, pos: token.pos, raw: token.raw };
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
        } else {
          break;
        }
        current = tokens.next();
      }

      yield emitCode(introducer, data, final);
    } else {
      current = tokens.next();
    }
  }
}

function emitCode(introducer: TOKEN, data: TOKEN[], final: TOKEN | undefined): CODE {
  switch (introducer.code) {
    case CSI_CODE:
      return parseCSI(introducer, data, final);
    case OSC_CODE:
      return parseOSC(introducer, data, final);
    case DCS_CODE:
    case DCS_OPEN:
      return parseDCS(introducer, data, final);
    case APC_CODE:
    case APC_OPEN:
      return parseAPC(introducer, data, final);
    case PM_CODE:
    case PM_OPEN:
      return parsePM(introducer, data, final);
    case SOS_CODE:
    case SOS_OPEN:
      return parseSOS(introducer, data, final);
    case ESC_CODE:
      return parseESC(introducer, data, final);
    default:
      return { type: CODE_TYPES.TEXT, pos: introducer.pos, raw: introducer.raw };
  }
}

export function parse(input: string): CODE[] {
  const tokens = tokenize(input);
  const result: CODE[] = [];
  let ti = 0;
  const tlen = tokens.length;

  while (ti < tlen) {
    const token = tokens[ti];

    if (token.type === TOKEN_TYPES.TEXT) {
      result.push({ type: CODE_TYPES.TEXT, pos: token.pos, raw: token.raw });
      ti++;
      continue;
    }

    if (token.type === TOKEN_TYPES.INTRODUCER) {
      const introducer = token;
      const data: TOKEN[] = [];
      let final: TOKEN | undefined;

      ti++;

      while (ti < tlen) {
        const nextToken = tokens[ti];
        if (nextToken.type === TOKEN_TYPES.DATA) {
          data.push(nextToken);
        } else if (nextToken.type === TOKEN_TYPES.FINAL) {
          final = nextToken;
          ti++;
          break;
        } else {
          break;
        }
        ti++;
      }

      result.push(emitCode(introducer, data, final));
    } else {
      ti++;
    }
  }

  return result;
}
