import {
  type CODE,
  type CONTROL_CODE,
} from '@ansi-tools/parser';

export const isCursorCommand = (code: CODE): code is CONTROL_CODE => {
  return (
    (
    code.type === 'CSI' &&
    (code.command === 'H' ||
      code.command === 'A' ||
      code.command === 'B' ||
      code.command === 'C' ||
      code.command === 'D' ||
      code.command === 'E' ||
      code.command === 'F' ||
      code.command === 'G' ||
      code.command === 'T' ||
      code.command === 'S')) ||
    (code.type === 'ESC' &&
      (code.command === '8' || code.command === '7')) ||
    (code.type === 'DEC' &&
      (code.command === 'l' || code.command === 'h'))
  );
};

export const isEraseCommand = (code: CODE): code is CONTROL_CODE => {
  return (
    (code.type === 'CSI' &&
    (code.command === 'J' || code.command === 'K')) ||
    (code.type === 'ESC' &&
     code.command === 'c')
  );
};
