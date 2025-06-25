import { html } from "uhtml";
import { stripAllAnsiCodes } from "./ansi.ts";
import truncatedWidth from "../../vendor/fast-string-truncated-width/index.js";

export const raw = (str: string) => html([str]);

export function getVisibleCharacterCount(rawAnsi: string) {
  const plainText = stripAllAnsiCodes(rawAnsi);
  if (!plainText) return 0;
  const segmenter = new Intl.Segmenter();
  const segments = segmenter.segment(plainText);
  return [...segments].length;
}

const replacements: { [key: string]: string } = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
};

export function escapeHtmlEntities(value: string) {
  return value.replace(/[&<>"']/g, (match) => replacements[match]);
}

export function newlines(value: string) {
  return value.replace(/(\r?\n|\r)/g, "\n");
}

export function unescapeNewlines(value: string) {
  return value.replace(/(\\r\\n|\\n|\\r)/g, "\n");
}

const segmenter = new Intl.Segmenter();

export function split(value: string, limit: number) {
  const graphemes = [...segmenter.segment(value)].map((seg) => seg.segment);
  return [graphemes.slice(0, limit).join(""), graphemes.slice(limit).join("")];
}

const widthOptions = {
  ansiWidth: 0,
  controlWidth: 0,
  tabWidth: 8,
  ambiguousWidth: 1,
  emojiWidth: 1,
  fullWidthWidth: 1,
  regularWidth: 1,
  wideWidth: 1,
};

export const truncate = (input: string, limit: number) => {
  if (!limit) return { width: 0, index: 0 };
  return truncatedWidth(input, { limit }, widthOptions);
};

export const getWidth = (input: string) => {
  return truncate(input, Infinity).width;
};
