const replacements: { [key: string]: string } = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
};

export function escapeHtmlEntities(value: string) {
  return value.replace(/[&<>"']/g, match => replacements[match]);
}

export function unescapeNewlines(value: string) {
  return value.replace(/(\\r\\n|\\n|\\r)/g, "\n");
}

const segmenter = new Intl.Segmenter();

export function split(value: string, limit: number) {
  const graphemes = [...segmenter.segment(value)].map(seg => seg.segment);
  return [graphemes.slice(0, limit).join(""), graphemes.slice(limit).join("")];
}
