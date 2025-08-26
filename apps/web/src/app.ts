import { render, document } from "isum/preactive";
import { Table } from "./table.ts";
import { Tools } from "./tools.ts";
import { Output } from "./output.ts";
import { Input } from "./input.ts";
import { rawInput } from "./app-state.ts";
import { examples } from "./examples.ts";

export function renderApp() {
  render(document.getElementById("input-container"), Input());
  render(document.getElementById("output-container"), Output());
  render(document.getElementById("table-container"), Table());
  render(document.getElementById("tools-container"), Tools());

  document.addEventListener("click", event => {
    if ((event.target as Element).closest('a[href="/"]')) {
      event.preventDefault();
      rawInput.value = examples[0].value;
      window.history.replaceState({}, "", "/");
    }
  });
}
