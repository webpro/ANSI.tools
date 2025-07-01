import { computed, signal } from "isum/preactive";
import { parseInput, type ParsedInput } from "./util/parse-input.ts";
import { escapeNewlines } from "./util/ansi.ts";

export interface State extends ParsedInput {
  input: string;
  width: number;
  length: number;
}

export const rawInput = signal("");

export const appState = computed(() => {
  const escaped = escapeNewlines(rawInput.value);
  const parsed = parseInput(escaped);
  const width = parsed.plain.length;
  const length = escaped.length;
  return { input: escaped, width, length, ...parsed };
});
