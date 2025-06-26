const ANSI_RAW_REGEX_GLOBAL = /(?:\u001b\[|\u009b)([?0-9;]*)?([@-~])|\u001b](.*?)(?:\u0007|\u001b\\)|\u001b([a-zA-Z])/g;

export function stripAnsi(text: string): string {
  return text.replace(ANSI_RAW_REGEX_GLOBAL, "");
}

export function stripAllAnsiCodes(text: string): string {
  return text.replace(ANSI_RAW_REGEX_GLOBAL, "");
}

export function stripNonSgrCodes(text: string): string {
  const allAnsiCodes = /\u001b(?:\[[?;\d]*[A-Za-z]|].*?(?:\u0007|\u001b\\)|c)/g;
  return text.replace(/\u009b/g, "\u001b[").replace(allAnsiCodes, (match) => {
    if (match.endsWith("m")) return match;
    if (match.startsWith("\u001b]8;")) return match;
    return "";
  });
}

export function escapeInput(text: string) {
  return text
    .replace(/\u001b/g, "\\u001b")
    .replace(/\u0007/g, "\\u0007")
    .replace(/\u009b/g, "\\u009b")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}

export function unescapeInput(text: string) {
  return text
    .replace(/\\u001[bB]/g, "\u001b")
    .replace(/\\u0007/g, "\u0007")
    .replace(/\\x1[bB]/g, "\x1b")
    .replace(/\\u009b/g, "\u009b")
    .replace(/(\\n|\\r)/g, "\n");
}

export function unoctal(text: string) {
  return text.replace(/\\033/g, "\u001b");
}

export function unescapeWithMap(literal: string): { raw: string; map: number[] } {
  let raw = "";
  const map: number[] = [];
  let i = 0;
  while (i < literal.length) {
    map.push(i);
    const sub6 = literal.substring(i, i + 6).toLowerCase();
    const sub4 = literal.substring(i, i + 4).toLowerCase();
    const sub2 = literal.substring(i, i + 2);

    if (sub6 === "\\u001b") {
      raw += "\u001b";
      i += 6;
    } else if (sub6 === "\\u009b") {
      raw += "\u009b";
      i += 6;
    } else if (sub6 === "\\u0007") {
      raw += "\u0007";
      i += 6;
    } else if (sub4 === "\\x1b") {
      raw += "\x1b";
      i += 4;
    } else if (sub4 === "\\033") {
      raw += "\u001b";
      i += 4;
    } else if (sub4 === "\\r\\n") {
      raw += "\n";
      i += 4;
    } else if (sub2 === "\\n" || sub2 === "\\r") {
      raw += "\n";
      i += 2;
    } else {
      raw += literal[i];
      i += 1;
    }
  }
  map.push(i);
  return { raw, map };
}
