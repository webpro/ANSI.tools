import { tokenize as tokenizeEscaped } from "../src/tokenize.escaped.ts";
import type { TOKEN } from "../src/types.ts";

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

export function tokenizeWithFinalizer(input: string): [TOKEN, TOKEN[], TOKEN | undefined] {
  const [introducer, ...rest] = tokenizeEscaped(input);
  return [introducer, rest.slice(0, -1), rest.at(-1)];
}
