export function escapeControlCodes(text: string) {
  return text
    .replace(/\r\n/g, "\\r\\n")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\u001b/g, "\\u001b")
    .replace(/\u009b/g, "\\u009b")
    .replace(/\u0007/g, "\\u0007");
}

export function unescapeInput(text: string) {
  return text
    .replace(/\\e/gi, "\u001b")
    .replace(/\\u001b/gi, "\u001b")
    .replace(/\\x1b/gi, "\u001b")
    .replace(/\\033/g, "\u001b")
    .replace(/\\u009b/gi, "\u009b")
    .replace(/\\u0007/gi, "\u0007")
    .replace(/\\a/gi, "\u0007")
    .replace(/\\x07/gi, "\u0007")
    .replace(/\\\\/g, "\u0007")
    .replace(/\\r/g, "\r")
    .replace(/\\n/g, "\n");
}

export function normalizeBeforeRender(text: string): string {
  return unescapeInput(text)
    .replace(/(\r\n|\r)/g, "\n")
    .replace(/\u009b/g, "\u001b[")
    .replace(/\u001b\].*?\u0007/g, "")
    .replace(/\u001bc/g, "")
    .replace(/\u001b\[[?0-9;]*[A-Za-z]/g, match => (match.endsWith("m") ? match : ""));
}
