import { readFileSync, writeFileSync } from "node:fs";
import init from "isum";
import { App } from "../src/app.ts";
import { renderTable } from "../src/lookup.ts";

{
  const template = readFileSync("dist/index.html", "utf-8");

  const { document } = init(template);

  new App();

  writeFileSync("dist/index.html", document.toString());
}

{
  const template = readFileSync("dist/lookup.html", "utf-8");

  const { document } = init(template);

  renderTable();

  writeFileSync("dist/lookup.html", document.toString());
}
