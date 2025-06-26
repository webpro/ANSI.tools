import { getVisibleCharacterCount, getWidth, newlines } from "./util/string.ts";
import { Table } from "./table.ts";
import { Tools } from "./tools.ts";
import { Output } from "./output.ts";
import { escape, stripAnsi, unescape, unescapeWithMap, unoctal } from "./util/ansi.ts";
import { Input } from "./input.ts";
import { examples } from "./examples.ts";

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
  #state?: State;

  #Input: Input;
  #Output: Output;
  #Table: Table;
  #Tools: Tools;

  constructor() {
    this.#Input = new Input();
    this.#Output = new Output();
    this.#Table = new Table();
    this.#Tools = new Tools();

    this.#Input.addEventListener("update-state", (event: Event) => {
      this.#setState((event as CustomEvent).detail.value);
      this.render();
    });

    this.#setState(examples[0].value);
    this.render();
  }

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

    this.#Input.update(this.#state);
    this.#Output.update(this.#state);
    this.#Table.update(this.#state);
    this.#Tools.update(this.#state);
  }
}
