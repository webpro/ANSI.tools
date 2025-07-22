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

const DEC_SPECIAL_GRAPHICS = new Map([
  [96, "◆"],
  [97, "▒"],
  [98, "␉"],
  [99, "␌"],
  [100, "␍"],
  [101, "␊"],
  [102, "°"],
  [103, "±"],
  [104, "␤"],
  [105, "␋"],
  [106, "┘"],
  [107, "┐"],
  [108, "┌"],
  [109, "└"],
  [110, "┼"],
  [111, "⎺"],
  [112, "⎻"],
  [113, "─"],
  [114, "⎼"],
  [115, "⎽"],
  [116, "├"],
  [117, "┤"],
  [118, "┴"],
  [119, "┬"],
  [120, "│"],
  [121, "≤"],
  [122, "≥"],
  [123, "π"],
  [124, "≠"],
  [125, "£"],
  [126, "·"],
]);

export function mapDECSpecialGraphics(char: string): string {
  const code = char.charCodeAt(0);
  return DEC_SPECIAL_GRAPHICS.get(code) ?? char;
}
