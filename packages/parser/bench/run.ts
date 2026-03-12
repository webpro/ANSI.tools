import { writeFileSync } from "node:fs";
import { bench, run, summary } from "mitata";
import { tokenizer } from "../src/tokenize.ts";
import { parser, parse } from "../src/parse.ts";
import { examples } from "../../../apps/web/src/examples.ts";
import { unescapeInput } from "../../../apps/web/src/util/string.ts";

const input = examples
  .filter(e => !e.value.startsWith("/"))
  .map(e => unescapeInput(e.value))
  .join("\n")
  .repeat(50);

const outFile = process.argv[2];

summary(() => {
  bench("parser", () => {
    const iter = parser(tokenizer(input));
    while (!iter.next().done);
  });
  bench("parse", () => parse(input));
});

const result = await run({ format: outFile ? "quiet" : "json" });
if (outFile) writeFileSync(outFile, JSON.stringify(result));
