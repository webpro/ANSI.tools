import { readFileSync, writeFileSync } from "node:fs";
import init from "uhtml/ssr";
import { getAllKnownCodes } from "../src/util/table.ts";

const filePath = "lookup.html";
const template = readFileSync(filePath, "utf-8");

const { document, render, html } = init(template);

const rows = getAllKnownCodes();
const rowTemplates = [];
for (const row of rows) {
  rowTemplates.push(
    html`<tr>
      <td><code>${row.code}</code></td>
      <td><code>${row.mnemonic}</code></td>
      <td>${row.description}</td>
      <td>${html([row.example])}</td>
    </tr>`,
  );
}

render(document.getElementById("ansi-codes-tbody"), html`${rowTemplates}`);

writeFileSync(filePath, document.toString());
