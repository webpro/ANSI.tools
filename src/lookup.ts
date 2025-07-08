import { computed, document, html, raw, render, signal } from "isum/preactive";
import { createRowsFromCodes, sortControlCodes } from "./util/table.ts";
import "./css/global.css";
import "./css/input.css";
import "./css/lookup.css";
import "./css/table.css";

export function renderLookupTable() {
  const container = document.getElementById("lookup-container");
  const rowData = sortControlCodes(createRowsFromCodes());
  const query = signal("");

  const rows = computed(() => {
    const q = query.value;
    return rowData.map(row => {
      const isHidden = q
        ? !`${row.code} ${row.type} ${row.mnemonic} ${row.description}`.toLowerCase().includes(q)
        : false;
      return html`<tr ?hidden=${isHidden}>
        <td><code>${row.code}</code></td>
        <td><code>${row.type}</code></td>
        <td><code>${row.mnemonic}</code></td>
        <td>${row.description}</td>
        <td>${raw(row.example)}</td>
      </tr>`;
    });
  });

  function handleSearch(event: InputEvent) {
    query.value = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

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
              <th>type</th>
              <th>mnemonic</th>
              <th>description</th>
              <th>example</th>
            </tr>
          </thead>
          <tbody id="ansi-codes-tbody">
            ${rows.value}
          </tbody>
        </table>

        <p>
          Something missing or incorrect?
          <a href="https://github.com/webpro/ANSI.tools">Feel free to report or fix</a>.
        </p>`
  );
}
