import { render, document } from "isum/preactive";
import { Table } from "./table.ts";
import { Tools } from "./tools.ts";
import { Output } from "./output.ts";
import { Input } from "./input.ts";
import { examples } from "./examples.ts";
import { rawInput } from "./app-state.ts";

const isClient = typeof window !== "undefined";
const index = Math.floor(Math.random() * examples.length);
const initialContent = isClient ? examples[index].value : "";

export function renderApp() {
  rawInput.value = initialContent;

  render(document.getElementById("input-container"), Input());
  render(document.getElementById("output-container"), Output());
  render(document.getElementById("table-container"), Table());
  render(document.getElementById("tools-container"), Tools());
}
