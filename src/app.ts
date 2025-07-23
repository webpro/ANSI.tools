import { render, document } from "isum/preactive";
import { Table } from "./table.ts";
import { Tools } from "./tools.ts";
import { Output } from "./output.ts";
import { Input } from "./input.ts";

export function renderApp() {
  render(document.getElementById("input-container"), Input());
  render(document.getElementById("output-container"), Output());
  render(document.getElementById("table-container"), Table());
  render(document.getElementById("tools-container"), Tools());
}
