import { html, render } from "uhtml";
import { examples } from "./examples.ts";
import "./css/input.css";
import type { State } from "./app.ts";

export class Input extends EventTarget {
  #container: HTMLElement;
  #state?: State;

  constructor() {
    super();
    this.#container = document.getElementById("input-container") as HTMLElement;
  }

  #setState(value: string) {
    const event = new CustomEvent("update-state", { detail: { value } });
    this.dispatchEvent(event);
  }

  #handleInput = (event: InputEvent) => {
    this.#setState(event.data ?? "");
  };

  #handleExampleClick = (value: string) => {
    this.#setState(value);
  };

  update(state: State) {
    this.#state = state;
    this.#render();
  }

  #render() {
    if (!this.#state) return;

    const view = html`
      <textarea class="content" id="input" rows="15" .value=${this.#state.input} @input=${this.#handleInput}></textarea>
      <div class="status-bar">
        <div class="status-item">length: ${this.#state.length}</div>
        <div class="status-spacer"></div>
        <div class="examples-dropdown">
          <span class="examples-trigger">Examples</span>
          <div id="example-buttons-container">
            ${examples
              .toReversed()
              .map(
                (example) =>
                  html`<button @click=${() => this.#handleExampleClick(example.value)}>${example.label}</button>`,
              )}
          </div>
        </div>
      </div>
    `;

    render(this.#container, view);
  }
}
