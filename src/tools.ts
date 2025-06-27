import { document, html, render } from "isum";
import { split, truncate, unescapeNewlines } from "./util/string.ts";
import type { State } from "./app.ts";
import { escapeInput } from "./util/ansi.ts";
import { Settings } from "./util/settings.ts";
import "./css/tools.css";

export class Tools {
  #container: HTMLElement;
  #state?: State;
  #limit: number | null = null;
  #plainTextElement: HTMLElement | null = null;
  #settings = new Settings("tools", { isRenderNewlines: false });

  constructor() {
    this.#container = document.getElementById("tools-container") as HTMLElement;
    document.addEventListener("selectionchange", this.#handlePlainTextSelection);
    this.render();
  }

  #handleTruncateInput = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const value = input.valueAsNumber;
    this.#limit = Number.isNaN(value) ? null : value;
    this.render();
  };

  #handlePlainTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !this.#plainTextElement?.contains(selection.anchorNode)) {
      return;
    }
    if (selection.anchorOffset !== 0) {
      return;
    }
    const selectionLength = selection.toString().length;
    if (this.#limit !== selectionLength) {
      this.#limit = selectionLength;
      this.render();
    }
  };

  #toggleSetting = (name: "isRenderNewlines") => {
    this.#settings.set(name, !this.#settings.get(name));
    this.render();
  };

  update(state: State) {
    this.#state = state;
    this.render();
  }

  render() {
    if (!this.#state) return;

    const limit = this.#limit ?? 0;
    const isRenderNewlines = this.#settings.get("isRenderNewlines");

    const [plainStart, plainEnd] = split(this.#state.plain, limit);

    const { index } = truncate(this.#state.unescaped, limit);
    const truncatedAnsi = this.#state.input.slice(0, this.#state.map[index]);
    const ansiStart = escapeInput(truncatedAnsi);
    const ansiEnd = escapeInput(this.#state.input.slice(ansiStart.length));
    const start = isRenderNewlines ? unescapeNewlines(ansiStart) : ansiStart;
    const end = isRenderNewlines ? unescapeNewlines(ansiEnd) : ansiEnd;

    const view = html`
      <div class="status-bar">
        <div class="status-item">plain text</div>
      </div>

      <pre class="utility-output" ref=${(el: HTMLElement) => (this.#plainTextElement = el)}>${this.#state.plain}</pre>

      <div class="status-bar">
        <div class="status-item">map position</div>
        <div class="status-spacer"></div>
        <label class="status-item">
          <input
            type="checkbox"
            class="toggle-newlines"
            .checked=${isRenderNewlines}
            @change=${() => this.#toggleSetting("isRenderNewlines")}
          />
          newlines
        </label>
      </div>

      <div class="tools-grid">
        <input
          type="number"
          id="truncate-width"
          min="0"
          max=${this.#state.width}
          placeholder="0"
          .value=${limit}
          @input=${this.#handleTruncateInput}
        />
        <pre class="plain"><span class="mark">${plainStart}</span>${plainEnd}</pre>
        <output type="number" value=${truncatedAnsi.length} />
        <pre class="ansi"><span class="mark">${start}</span>${end}</pre>
      </div>
    `;
    render(this.#container, view);
  }
}
