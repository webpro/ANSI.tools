export function escapeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\\r\\n").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
}

export function escapeInput(text: string) {
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
    .replace(/\\u001b/gi, "\u001b")
    .replace(/\\x1b/gi, "\u001b")
    .replace(/\\033/g, "\u001b")
    .replace(/\\u009b/gi, "\u009b")
    .replace(/\\u0007/gi, "\u0007");
}

export function filterForAnsiUp(text: string): string {
  return text
    .replace(/(\\r\\n|\\n|\\r)/g, "\n")
    .replace(/\\u009b/g, "\\u001b[")
    .replace(/\\u001b\].*?\\u0007/g, "")
    .replace(/\\u001bc/g, "")
    .replace(/\\u001b\[[?0-9;]*[A-Za-z]/g, match => {
      if (match.endsWith("m")) return match;
      return "";
    });
}
