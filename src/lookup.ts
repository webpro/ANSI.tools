import { document, html, raw, render } from "isum";
import { getAllKnownCodes, sortAnsiCodes } from "./util/table.ts";
import "./css/global.css";
import "./css/input.css";
import "./css/lookup.css";
import "./css/table.css";

export function renderTable() {
  const tableBody = document.getElementById("ansi-codes-tbody");
  if (tableBody?.firstChild) return;
  const rows = sortAnsiCodes(getAllKnownCodes());
  const rowTemplates = [];
  for (const row of rows) {
    rowTemplates.push(
      html`<tr>
        <td><code>${row.code}</code></td>
        <td><code>${row.mnemonic}</code></td>
        <td>${row.description}</td>
        <td>${raw(row.example)}</td>
      </tr>`,
    );
  }

  render(document.getElementById("ansi-codes-tbody"), html`${rowTemplates}`);
}

export function attachSearchHandler() {
  const searchInput = document.getElementById("ansi-search") as HTMLInputElement;
  const tableBody = document.getElementById("ansi-codes-tbody");
  if (!tableBody) return;

  const rows: { element: HTMLElement; text: string }[] = [];
  for (const row of tableBody.querySelectorAll("tr")) {
    const text = row.textContent?.toLowerCase() ?? "";
    rows.push({ element: row as HTMLElement, text: text });
  }

  searchInput.addEventListener("input", (e) => {
    const query = (e.target as HTMLInputElement).value.trim().toLowerCase();
    for (const row of rows) row.element.hidden = !row.text.includes(query);
  });
}
