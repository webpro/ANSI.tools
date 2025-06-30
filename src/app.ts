import { Table } from "./table.ts";
import { Tools } from "./tools.ts";
import { Output } from "./output.ts";
import { Input } from "./input.ts";
import { examples } from "./examples.ts";
import { parseInput, type ParsedInput } from "./util/parse-input.ts";
import { escapeNewlines } from "./util/ansi.ts";

const isClient = typeof window !== "undefined";
const index = Math.floor(Math.random() * examples.length);
const initialContent = isClient ? examples[index].value : "";

export interface State extends ParsedInput {
  input: string;
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
      this.#render();
    });

    this.#setState(initialContent);
    this.#render();
  }

  #setState(value: string) {
    const escaped = escapeNewlines(value);
    const state = parseInput(escaped);
    const width = state.plain.length;
    const length = escaped.length;
    this.#state = { input: escaped, width, length, ...state };
  }

  #render() {
    if (!this.#state) return;

    this.#Input.update(this.#state);
    this.#Output.update(this.#state);
    this.#Table.update(this.#state);
    this.#Tools.update(this.#state);
  }
}
