import type { CODE_TYPES, TOKEN_TYPES } from "./constants.ts";

export type TOKEN = {
  type: keyof typeof TOKEN_TYPES;
  pos: number;
  raw: string;
  code?: string;
  intermediate?: string;
};

export type CONTROL_CODE_TYPE = Exclude<keyof typeof CODE_TYPES, TEXT["type"]>;

export type CONTROL_CODE = {
  type: CONTROL_CODE_TYPE;
  command: string;
  raw: string;
  params: string[];
  pos: number;
};

export type TEXT = {
  type: "TEXT";
  raw: string;
  pos: number;
};

export type CODE = CONTROL_CODE | TEXT;
