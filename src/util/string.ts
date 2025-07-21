export function unescapeInput(text: string) {
  return text
    .replace(/(\\u001b|\\x1b|\\033|\\e)/gi, "\u001b")
    .replace(/\\u009b/gi, "\u009b")
    .replace(/(\\u0007|\\a|\\x07)/gi, "\u0007")
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\\\/g, "\\")
    .replace(/\\r/g, "\r")
    .replace(/\\n/g, "\n");
}

export function unescapeNewlines(value: string) {
  return value.replace(/(\\r\\n|\\n|\\r)/g, "\n");
}

const segmenter = new Intl.Segmenter();

export function getSegments(value: string): string[] {
  return Array.from(segmenter.segment(value)).map(seg => seg.segment);
}

export function split(value: string, limit: number): [string, string] {
  if (limit <= 0) return ["", value];
  let i = 0;
  for (const segment of segmenter.segment(value)) {
    i++;
    if (i === limit) {
      const splitIndex = segment.index + segment.segment.length;
      return [value.slice(0, splitIndex), value.slice(splitIndex)];
    }
  }
  return [value, ""];
}

export function toRaw(value: string, isRaw: boolean): string {
  return isRaw ? value.split("\u001b").join("␛") : value;
}

const specialCases: Record<number, string> = {
  96: "◆",
  97: "▒",
  98: "␉",
  99: "␌",
  100: "␍",
  101: "␊",
  102: "°",
  103: "±",
  104: "␤",
  105: "␋",
  121: "≤",
  122: "≥",
  123: "π",
  124: "≠",
  125: "£",
  126: "·",
};

const boxDrawingMap: Record<number, number> = {
  106: 0x2518,
  107: 0x2510,
  108: 0x250c,
  109: 0x2514,
  110: 0x253c,
  111: 0x23ba,
  112: 0x23bb,
  113: 0x2500,
  114: 0x23bc,
  115: 0x23bd,
  116: 0x251c,
  117: 0x2524,
  118: 0x2534,
  119: 0x252c,
  120: 0x2502,
};

export function mapDECSpecialGraphics(char: string): string {
  const code = char.charCodeAt(0);
  if (code < 96 || code > 126) return char;
  if (specialCases[code]) return specialCases[code];
  if (code >= 106 && code <= 120) return String.fromCharCode(boxDrawingMap[code] || code);
  return char;
}
