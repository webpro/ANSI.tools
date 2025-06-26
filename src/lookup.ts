import { html, render } from "uhtml";
import { getAllKnownCodes } from "./util/table.ts";
import { raw } from "./util/string.ts";
import "./css/lookup.css";

const rows = getAllKnownCodes();

function attachSearchHandler() {
  const searchInput = document.getElementById("ansi-search") as HTMLInputElement;
  searchInput.addEventListener("input", (e: Event) => {
    const q = (e.target as HTMLInputElement).value.trim().toLowerCase();
    const filtered = !q
      ? rows
      : rows.filter(
          (row) =>
            row.code.toLowerCase().includes(q) ||
            row.mnemonic.toLowerCase().includes(q) ||
            row.description.toLowerCase().includes(q),
        );
    renderTable(filtered);
  });
}

function renderTable(filteredRows = rows) {
  render(
    document.getElementById("ansi-codes-tbody"),
    html`
      ${filteredRows.map(
        (row) => html`
          <tr>
            <td><code>${row.code}</code></td>
            <td><code>${row.mnemonic}</code></td>
            <td>${row.description}</td>
            <td>${raw(row.example)}</td>
          </tr>
        `,
      )}
    `,
  );
}

attachSearchHandler();
renderTable();
