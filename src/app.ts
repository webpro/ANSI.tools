import { html, render } from "uhtml";
import { getVisibleCharacterCount, getWidth, newlines } from "./util/string.ts";
import { Table } from "./table.ts";
import { Tools } from "./tools.ts";
import { Output } from "./output.ts";
import { examples } from "./examples.ts";
import { escape, stripAnsi, unescape, unescapeWithMap, unoctal } from "./util/ansi.ts";
import "./app.css";

export interface State {
  input: string;
  escaped: string;
  unescaped: string;
  map: number[];
  plain: string;
  width: number;
  length: number;
}

export class App {
  #container: HTMLElement;
  #state?: State;
  #Output: Output;
  #Table: Table;
  #Tools: Tools;

  constructor() {
    this.#container = document.getElementById("input-container") as HTMLElement;
    this.#Output = new Output();
    this.#Table = new Table();
    this.#Tools = new Tools();
    this.#setState(examples[0].value);
    this.render();
  }

  #handleInput = (event: Event) => {
    this.#setState((event.target as HTMLTextAreaElement).value);
    this.render();
  };

  #handleExampleClick = (value: string) => {
    this.#setState(value);
    this.render();
  };

  #setState(value: string) {
    const un = unescape(value);
    const escaped = escape(value);
    const { raw: unescaped, map } = unescapeWithMap(escaped);
    const plain = newlines(stripAnsi(unoctal(un)));
    const width = getWidth(unescaped);
    const length = getVisibleCharacterCount(escaped);
    this.#state = { input: value, escaped, unescaped, plain, width, length, map };
  }

  render() {
    if (!this.#state) return;

    this.#Output.update(this.#state);
    this.#Table.update(this.#state);
    this.#Tools.update(this.#state);

    const view = html`
      <textarea
        class="content"
        id="input"
        rows="15"
        .value=${this.#state.escaped}
        @input=${this.#handleInput}
      ></textarea>
      <div class="status-bar">
        <div class="status-item">width: ${this.#state.length}</div>
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
