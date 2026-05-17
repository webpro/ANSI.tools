import { readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";

const targets = [
  { src: "src/tokenize.ts", out: "src/tokenize.gen.ts" },
  { src: "src/tokenize.escaped.ts", out: "src/tokenize.escaped.gen.ts" },
];

const root = new URL("..", import.meta.url).pathname;

for (const { src, out } of targets) {
  const path = root + src;
  const text = readFileSync(path, "utf8");
  const sf = ts.createSourceFile(src, text, ts.ScriptTarget.ESNext, true);

  const imports: string[] = [];
  let fn: ts.FunctionDeclaration | undefined;
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st)) imports.push(st.getText(sf));
    if (ts.isFunctionDeclaration(st) && st.name?.text === "tokenizer" && st.asteriskToken) fn = st;
  }
  if (!fn?.body) throw new Error(`no tokenizer generator in ${src}`);

  const body = fn.body;
  const innerStart = body.getStart(sf) + 1;
  const innerEnd = body.getEnd() - 1;

  const edits: { start: number; end: number; text: string }[] = [];
  const walk = (n: ts.Node) => {
    if (ts.isYieldExpression(n) && n.expression) {
      edits.push({
        start: n.getStart(sf),
        end: n.expression.getEnd(),
        text: `result.push(${text.slice(n.expression.getStart(sf), n.expression.getEnd())})`,
      });
    }
    ts.forEachChild(n, walk);
  };
  walk(body);

  let inner = text.slice(innerStart, innerEnd);
  for (const e of edits.sort((a, b) => b.start - a.start)) {
    inner = inner.slice(0, e.start - innerStart) + e.text + inner.slice(e.end - innerStart);
  }

  const banner =
    `// AUTO-GENERATED from ${src}. Do not edit.\n`;

  const result =
    `${banner}\n${imports.join("\n")}\n\n` +
    `export function tokenize(input: string): TOKEN[] {\n` +
    `  const result: TOKEN[] = [];\n${inner}\n  return result;\n}\n`;

  writeFileSync(root + out, result);
  console.error(`gen: ${out} (${edits.length} yields -> result.push)`);
}
