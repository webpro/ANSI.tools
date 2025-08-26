import { readFileSync, writeFileSync } from "node:fs";
import init from "isum/preactive";
import { renderApp } from "../src/app.ts";
import { renderLookupTable } from "../src/lookup.ts";

const pages = {
  "dist/index.html": () => renderApp(),
  "dist/lookup.html": () => renderLookupTable(),
};

for (const [filePath, renderPage] of Object.entries(pages)) {
  const template = readFileSync(filePath, "utf-8");
  const { document } = init(template);
  renderPage();
  writeFileSync(filePath, document.toString());
}
