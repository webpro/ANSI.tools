import { ansiToPre } from "ansi-to-pre";

const SGR_SAMPLE_TEXT = "Sample";
const SGR_SAMPLE_HTML = ansiToPre(SGR_SAMPLE_TEXT);
export const SGR_MAP: Record<string, string> = {
  "1:2": "sample-shadow",
  "4:0": "sample-underline-none",
  "4:1": "sample-underline-single",
  "4:2": "sample-underline-double",
  "4:3": "sample-underline-wavy",
  "4:4": "sample-underline-dotted",
  "4:5": "sample-underline-dashed",
  "5": "sample-blink-slow",
  "6": "sample-blink-fast",
  "8:7": "sample-overstrike",
  "21": "sample-underline-double",
  "58;2": "sample-underline-colored-24bit",
  "58;5": "sample-underline-colored-8bit",
  "73": "sample-superscript",
  "74": "sample-subscript",
};

export function render(className: string) {
  const span = `<span class="${className}">${SGR_SAMPLE_TEXT}</span>`;
  return SGR_SAMPLE_HTML.replace(SGR_SAMPLE_TEXT, span);
}
