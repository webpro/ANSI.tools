import { html, render } from "uhtml";
import { raw } from "./util/html.ts";
import type { State } from "./app.ts";
import { analyzeAnsi, sortAnsiCodes } from "./util/table.ts";
import { Settings } from "./util/settings.ts";
import "./css/table.css";

export class Table {
  #container: HTMLElement;
  #state?: State;
  #settings = new Settings("table", { isShowDuplicates: false, isSortCodes: false });

  constructor() {
    this.#container = document.getElementById("table-container") as HTMLElement;
    this.render();
  }

  update(state: State) {
    this.#state = state;
    this.render();
  }

  #toggleSetting = (name: "isShowDuplicates" | "isSortCodes") => {
    this.#settings.set(name, !this.#settings.get(name));
    this.render();
  };

  render() {
    if (!this.#state) return;

    let rows = analyzeAnsi(this.#state.input);
    const size = rows.length;

    const isShowDuplicates = this.#settings.get("isShowDuplicates");
    const isSortCodes = this.#settings.get("isSortCodes");

    if (!isShowDuplicates) rows = [...new Map(rows.map((item) => [item.code, item])).values()];
    if (isSortCodes) rows = sortAnsiCodes(rows);

    const view = html`
      <div class="status-bar">
        <div class="status-item">detected: ${size}</div>
        <div class="status-spacer"></div>
        <div class="status-item">
          <label>
            <input
              type="checkbox"
              data-key="show-duplicates"
              .checked=${isShowDuplicates}
              @change=${() => this.#toggleSetting("isShowDuplicates")}
            />
            duplicates
          </label>
        </div>
        <div class="status-item">
          <label>
            <input
              type="checkbox"
              data-key="sort-codes"
              .checked=${isSortCodes}
              @change=${() => this.#toggleSetting("isSortCodes")}
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
            <th>example</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(
            (info) => html`
              <tr>
                <td><code>${info.code}</code></td>
                <td><code>${info.mnemonic}</code></td>
                <td>${info.description}</td>
                <td>${raw(info.example)}</td>
              </tr>
            `,
          )}
        </tbody>
      </table>
    `;
    render(this.#container, view);
  }
}
