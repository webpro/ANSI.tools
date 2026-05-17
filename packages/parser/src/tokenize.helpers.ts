import { APC, CAN, CSI, DCS, ESC, OSC, PM, SOS, SUB } from "./constants.ts";

export function isInterrupter(c: number): boolean {
  return (
    c === CAN || c === SUB || c === ESC || c === CSI || c === OSC || c === DCS || c === APC || c === PM || c === SOS
  );
}

export function isC0Interrupter(c: number): boolean {
  return c === CAN || c === SUB;
}

export function isSequenceStart(c: number): boolean {
  return c === ESC || c === CSI || c === OSC || c === DCS || c === APC || c === PM || c === SOS;
}

export function is8BitIntroducer(c: number): boolean {
  return c === CSI || c === OSC || c === DCS || c === APC || c === PM || c === SOS;
}
