import { document, html, render, raw } from "isum";
import { AnsiUp } from "ansi_up";
import { filterForAnsiUp, unescapeInput } from "./util/ansi.ts";
import { Settings } from "./util/settings.ts";
import type { State } from "./app.ts";
import "./css/output.css";
import { getVisualWidth } from "./util/parse-input.ts";

export class Output {
  #container: HTMLElement;
  #state?: State;
  #settings = new Settings("output", { isLightMode: false, isGridVisible: false });

  constructor() {
    this.#container = document.getElementById("output-container") as HTMLElement;
  }

  #toggleSetting = (name: "isLightMode" | "isGridVisible") => {
    this.#settings.set(name, !this.#settings.get(name));
    this.#render();
  };

  update(state: State) {
    this.#state = state;
    this.#render();
  }

  #render() {
    if (!this.#state) return;

    const filteredEscaped = filterForAnsiUp(this.#state.input);
    const filteredUnescaped = unescapeInput(filteredEscaped);
    const textToRender = filteredUnescaped.endsWith("\n") ? `${filteredUnescaped}\u200b` : filteredUnescaped;
    const convert = new AnsiUp();
    const outputHtml = convert.ansi_to_html(textToRender);
    const whitespaceStart = outputHtml.match(/^\s+/)?.[0] ?? "";
    const lines = this.#state.plain.split("\n");
    const columns = lines.reduce((max, line) => Math.max(max, getVisualWidth(line)), 0);

    const isLightMode = this.#settings.get("isLightMode");
    const isGridVisible = this.#settings.get("isGridVisible");

    if (isLightMode) this.#container.classList.add("light-bg");
    else this.#container.classList.remove("light-bg");

    if (isGridVisible) this.#container.classList.add("grid-visible");
    else this.#container.classList.remove("grid-visible");

    const view = html`
      <div class="content">
        <pre id="visual-output">${whitespaceStart}${raw(outputHtml)}</pre>
      </div>
      <div class="status-bar">
        <div class="status-item">length: ${this.#state.width}</div>
        <div class="status-item">rows: ${lines.length}</div>
        <div class="status-item">columns: ${columns}</div>
        <div class="status-spacer"></div>
        <div class="status-item">
          <label>
            <input
              type="checkbox"
              data-key="light-mode"
              .checked=${isLightMode}
              @change=${() => this.#toggleSetting("isLightMode")}
            />
            invert
          </label>
        </div>
        <div class="status-item">
          <label>
            <input
              type="checkbox"
              data-key="grid-visible"
              .checked=${isGridVisible}
              @change=${() => this.#toggleSetting("isGridVisible")}
            />
            grid
          </label>
        </div>
      </div>
    `;
    render(this.#container, view);
  }
}
