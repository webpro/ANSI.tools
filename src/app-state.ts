import { computed, signal } from "isum/preactive";
import { parseInput } from "./util/parse-input.ts";

export const rawInput = signal("");

export const appState = computed(() => {
  const input = rawInput.value;
  const parsed = parseInput(input);
  const width = parsed.plain.length;
  const length = input.length;
  return { input, width, length, ...parsed };
});
