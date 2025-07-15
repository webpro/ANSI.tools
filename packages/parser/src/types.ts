import type { TOKEN_TYPES } from "./constants.ts";

export type TOKEN = {
  type: keyof typeof TOKEN_TYPES;
  pos: number;
  raw: string;
  code?: string;
  intermediate?: string;
};

export type CONTROL_CODE = {
  type: "CSI" | "DCS" | "DEC" | "ESC" | "OSC" | "SGR" | "STRING" | "PRIVATE";
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
