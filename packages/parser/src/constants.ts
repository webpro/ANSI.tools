export const BELL = String.fromCharCode(7);
export const CAN = String.fromCharCode(24);
export const SUB = String.fromCharCode(26);
export const ESC = String.fromCharCode(27);
export const BACKSLASH = String.fromCharCode(92);
export const DCS = String.fromCharCode(144);
export const SOS = String.fromCharCode(152);
export const CSI = String.fromCharCode(155);
export const ST = String.fromCharCode(156);
export const OSC = String.fromCharCode(157);
export const PM = String.fromCharCode(158);
export const APC = String.fromCharCode(159);

export const CSI_OPEN = "[";
export const OSC_OPEN = "]";
export const DEC_OPEN = "?";
export const PRIVATE_OPENERS = new Set(["<", "=", ">"]);

export const DCS_OPEN = "P";
export const APC_OPEN = "_";
export const SOS_OPEN = "^";
export const PM_OPEN = "X";
export const STRING_OPENERS = new Set([DCS_OPEN, APC_OPEN, SOS_OPEN, PM_OPEN]);

export const INTERRUPTERS = new Set([CAN, SUB, ESC, CSI, OSC, DCS, APC, PM, SOS]);
export const C0_INTERRUPTERS = new Set([CAN, SUB]);

export const TOKEN_TYPES = {
  TEXT: "TEXT",
  INTRODUCER: "INTRODUCER",
  DATA: "DATA",
  FINAL: "FINAL",
} as const;

export const CODE_TYPES = {
  CSI: "CSI",
  DCS: "DCS",
  DEC: "DEC",
  ESC: "ESC",
  OSC: "OSC",
  PRIVATE: "PRIVATE",
  SGR: "SGR",
  STRING: "STRING",
  TEXT: "TEXT",
} as const;
