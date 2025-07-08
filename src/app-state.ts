import { computed, signal } from "isum/preactive";
import { parseInput } from "./util/parse-input.ts";
import { escapeControlCodes } from "./util/ansi.ts";

export const rawInput = signal("");

export const appState = computed(() => {
  const input = rawInput.value;
  const escaped = escapeControlCodes(input);
  const parsed = parseInput(escaped);
  const width = parsed.plain.length;
  const length = input.length;
  return { input: escaped, width, length, ...parsed };
});
