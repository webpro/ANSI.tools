import { html, computed, raw } from "isum/preactive";
import { extractControlCodes, sortControlCodes } from "./util/table.ts";
import { createSettingsStore } from "./util/settings.ts";
import { appState } from "./app-state.ts";
import "./css/table.css";

function visualizeEsc(text: string): string {
  return text.split("\u001b").join("ESC");
}

export function Table() {
  const settings = createSettingsStore("table", { isShowDuplicates: false, isSortCodes: false });

  const rows = computed(() => {
    let rows = extractControlCodes(appState.value.codes);
    if (!settings.isShowDuplicates.value) rows = [...new Map(rows.map(item => [item.code, item])).values()];
    if (settings.isSortCodes.value) rows = sortControlCodes(rows);
    return rows;
  });

  return () => html`
    <div class="status-bar">
      <div class="status-item">count: ${rows.value.length}</div>
      <div class="status-spacer"></div>
      <div class="status-item">
        <label>
          <input
            type="checkbox"
            data-key="show-duplicates"
            ?checked=${settings.isShowDuplicates.value}
            @change=${() => {
              settings.isShowDuplicates.value = !settings.isShowDuplicates.peek();
            }}
          />
          duplicates
        </label>
      </div>
      <div class="status-item">
        <label>
          <input
            type="checkbox"
            data-key="sort-codes"
            ?checked=${settings.isSortCodes.value}
            @change=${() => {
              settings.isSortCodes.value = !settings.isSortCodes.peek();
            }}
          />
          sort
        </label>
      </div>
    </div>

    <table class="ansi-codes">
      <thead>
        <tr>
          <th>code</th>
          <th>mnemonic</th>
          <th>description</th>
        </tr>
      </thead>
      <tbody>
        ${rows.value.map(
          info => html`
            <tr>
              <td><code>${visualizeEsc(info.code)}</code></td>
              <td><code>${info.mnemonic}</code></td>
              <td>${info.description}</td>
            </tr>
          `
        )}
      </tbody>
    </table>
  `;
}
