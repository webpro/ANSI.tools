import { document, html, render } from "isum";
import { split, unescapeNewlines } from "./util/string.ts";
import type { State } from "./app.ts";
import { escapeInput } from "./util/ansi.ts";
import { Settings } from "./util/settings.ts";
import { getPosition, getPositionReversed } from "./util/parse-input.ts";
import "./css/tools.css";

export class Tools {
  #container: HTMLElement;
  #state?: State;
  #limitPlain: number | null = null;
  #limitInput: number | null = null;
  #settings = new Settings("tools", { isRenderNewlines: false, isGreedy: true });

  constructor() {
    this.#container = document.getElementById("tools-container") as HTMLElement;
  }

  #handleTruncateInput = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const value = input.valueAsNumber;
    this.#limitPlain = Number.isNaN(value) ? null : value;
    this.#limitInput = null;
    this.render();
  };

  #handleAnsiIndexInput = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const value = input.valueAsNumber;
    this.#limitInput = Number.isNaN(value) ? null : value;
    this.#limitPlain = null;
    this.render();
  };

  #toggleSetting = (name: "isRenderNewlines" | "isGreedy") => {
    this.#settings.set(name, !this.#settings.get(name));
    this.render();
  };

  update(state: State) {
    this.#state = state;
    this.#limitPlain = null;
    this.#limitInput = null;
    this.render();
  }

  render() {
    if (!this.#state) return;

    const isRenderNewlines = this.#settings.get("isRenderNewlines");
    const isGreedy = this.#settings.get("isGreedy");

    let limitPlain = this.#limitPlain ?? 0;
    let limitInput = this.#limitInput ?? 0;

    if (this.#limitInput !== null) {
      limitPlain = getPositionReversed(this.#state, this.#limitInput);
    } else {
      limitInput = getPosition(this.#state, this.#limitPlain ?? 0, isGreedy);
    }

    const [plainStart, plainEnd] = split(this.#state.plain, limitPlain);

    const truncatedAnsi = this.#state.input.slice(0, limitInput);
    const ansiStart = escapeInput(truncatedAnsi);
    const ansiEnd = escapeInput(this.#state.input.slice(limitInput));
    const start = isRenderNewlines ? unescapeNewlines(ansiStart) : ansiStart;
    const end = isRenderNewlines ? unescapeNewlines(ansiEnd) : ansiEnd;

    const view = html`
      <div class="status-bar">
        <div class="status-item">plain text</div>
      </div>

      <pre class="utility-output">${this.#state.plain}</pre>

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
        <label class="status-item">
          <input
            type="checkbox"
            class="toggle-greedy"
            .checked=${isGreedy}
            @change=${() => this.#toggleSetting("isGreedy")}
          />
          greedy
        </label>
      </div>

      <div class="tools-grid">
        <input
          type="number"
          id="truncate-width"
          min="0"
          max=${this.#state.width}
          placeholder="0"
          .value=${limitPlain}
          @input=${this.#handleTruncateInput}
        />
        <pre class="plain"><span class="mark">${plainStart}</span><span class="unmark">${plainEnd}</span></pre>
        <input
          type="number"
          id="truncate-index"
          min="0"
          max=${this.#state.length}
          step="1"
          placeholder="0"
          .value=${limitInput}
          @input=${this.#handleAnsiIndexInput}
        />
        <pre class="ansi"><span class="mark">${start}</span><span class="unmark">${end}</span></pre>
      </div>
    `;
    render(this.#container, view);
  }
}
