import { computed, signal } from "isum/preactive";
import { parseInput } from "./util/parse-input.ts";
import { getSegments } from "./util/string.ts";

export const rawInput = signal("");

export const appState = computed(() => {
  const input = rawInput.value;
  const parsed = parseInput(input);
  const width = parsed.plain.length;
  const length = getSegments(input).length;
  return { input, width, length, ...parsed };
});
