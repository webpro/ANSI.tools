export const BELL = 7;
export const BELL_CODE = String.fromCharCode(BELL);
export const CAN = 24;
export const CAN_CODE = String.fromCharCode(CAN);
export const SUB = 26;
export const SUB_CODE = String.fromCharCode(SUB);
export const ESC = 27;
export const ESC_CODE = String.fromCharCode(ESC);
export const BACKSLASH = 92;
export const BACKSLASH_CODE = String.fromCharCode(BACKSLASH);
export const DCS = 144;
export const DCS_CODE = String.fromCharCode(DCS);
export const SOS = 152;
export const SOS_CODE = String.fromCharCode(SOS);
export const CSI = 155;
export const CSI_CODE = String.fromCharCode(CSI);
export const ST = 156;
export const ST_CODE = String.fromCharCode(ST);
export const OSC = 157;
export const OSC_CODE = String.fromCharCode(OSC);
export const PM = 158;
export const PM_CODE = String.fromCharCode(PM);
export const APC = 159;
export const APC_CODE = String.fromCharCode(APC);

export const CSI_OPEN = "[".charCodeAt(0);
export const OSC_OPEN = "]".charCodeAt(0);
export const DEC_OPEN = "?".charCodeAt(0);
export const PRIVATE_OPENERS = new Set(["<", "=", ">"]);

export const DCS_OPEN = "P";
export const APC_OPEN = "_";
export const SOS_OPEN = "^";
export const PM_OPEN = "X";
export const STRING_OPENERS = new Set([DCS_OPEN, APC_OPEN, SOS_OPEN, PM_OPEN]);

export const INTERRUPTERS = new Set<number>([CAN, SUB, ESC, CSI, OSC, DCS, APC, PM, SOS]);
export const C0_INTERRUPTERS = new Set([CAN, SUB]);

export const PARAM_SEPARATOR = /[;:]/;

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
