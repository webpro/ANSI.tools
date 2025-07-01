import { readFileSync, writeFileSync } from "node:fs";
import init from "isum";
import { App } from "../src/app.ts";
import { renderTable } from "../src/lookup.ts";

const pages = {
  "dist/index.html": () => new App(),
  "dist/lookup.html": () => renderTable(),
};

for (const [filePath, render] of Object.entries(pages)) {
  const template = readFileSync(filePath, "utf-8");
  const { document } = init(template);
  render();
  writeFileSync(filePath, document.toString());
}
