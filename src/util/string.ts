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
