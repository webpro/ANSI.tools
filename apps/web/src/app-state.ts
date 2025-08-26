import { computed, signal } from "isum/preactive";
import { parseInput } from "./util/parse-input.ts";
import { getSegments, toRaw } from "./util/string.ts";

export const rawInput = signal("");

export const appState = computed(() => {
  const input = rawInput.value;
  const parsed = parseInput(input);
  const width = parsed.plain.length;
  const length = getSegments(input).length;
  const raw = toRaw(input, parsed.isRaw);
  return { input, width, length, raw, ...parsed };
});
