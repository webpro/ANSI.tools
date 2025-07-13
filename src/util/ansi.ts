export function unescapeInput(text: string) {
  return text
    .replace(/(\\u001b|\\x1b|\\033|\\e)/gi, "\u001b")
    .replace(/\\u009b/gi, "\u009b")
    .replace(/(\\u0007|\\a|\\x07|\\\\)/gi, "\u0007")
    .replace(/\\r/g, "\r")
    .replace(/\\n/g, "\n");
}
