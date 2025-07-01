import { document, effect, html, raw, render, signal, type Hole } from "isum/preactive";
import { getAllKnownCodes, sortAnsiCodes } from "./util/table.ts";
import "./css/global.css";
import "./css/input.css";
import "./css/lookup.css";
import "./css/table.css";

export function renderLookupTable() {
  const container = document.getElementById("lookup-container");
  const allRows = sortAnsiCodes(getAllKnownCodes());
  const query = signal("");

  const rowTemplates: Hole[] = [];
  for (const row of allRows) {
    rowTemplates.push(
      html`<tr>
        <td><code>${row.code}</code></td>
        <td><code>${row.mnemonic}</code></td>
        <td>${row.description}</td>
        <td>${raw(row.example)}</td>
      </tr>`
    );
  }

  const tableRows: { element: HTMLTableRowElement; text: string }[] = [];

  function handleSearch(event: InputEvent) {
    query.value = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  effect(() => {
    if (tableRows.length === 0) {
      const tableBody = document.getElementById("ansi-codes-tbody");
      if (tableBody) {
        for (const row of tableBody.querySelectorAll("tr")) {
          const text = row.textContent?.toLowerCase() ?? "";
          tableRows.push({ element: row as HTMLTableRowElement, text: text });
        }
      }
    }
    const q = query.value;
    for (const row of tableRows) row.element.hidden = !row.text.includes(q);
  });

  render(
    container,
    () =>
      html`<div class="status-bar">
          <div class="status-item">
            <input type="search" placeholder="Filter" autocomplete="off" .value=${query.value} @input=${handleSearch} />
          </div>
        </div>
        <table class="ansi-codes">
          <thead>
            <tr>
              <th>code</th>
              <th>mnemonic</th>
              <th>description</th>
              <th>example</th>
            </tr>
          </thead>
          <tbody id="ansi-codes-tbody">
            ${rowTemplates}
          </tbody>
        </table>`
  );
}
