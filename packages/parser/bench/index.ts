import { Bench, type TaskResult } from "tinybench";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { inputs } from "./inputs.ts";
import { parseArgs } from "node:util";

type Result = TaskResult & { name: string };
type Cache = Record<string, Record<string, Record<string, Result>>>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgDir = dirname(__dirname);
const tmpDir = join(pkgDir, "tmp");
const cacheFile = join(tmpDir, "bench.json");

const hash = (value: string) => createHash("sha1").update(value).digest("hex").slice(0, 7);

const build = () => execSync("pnpm run build", { cwd: pkgDir, stdio: "inherit" });

const isDirty = () => execSync("git status --porcelain --untracked-files=no").toString() !== "";

const getTag = () => execSync("git describe --tags --exact-match 2>/dev/null || true").toString().trim();

const getSha = () => execSync("git rev-parse --short=8 HEAD 2>/dev/null").toString().trim();

const getRef = () => getTag() || getSha();

const withoutSamples = (t: TaskResult) => JSON.parse(JSON.stringify(t, (k, v) => (k === "samples" ? undefined : v)));

const read = () => existsSync(cacheFile) && import(cacheFile, { with: { type: "json" } });

function write(cache: Cache) {
  mkdirSync(tmpDir, { recursive: true });
  writeFileSync(cacheFile, JSON.stringify(cache), "utf8");
}

const format = (value: number) => {
  const str = `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`.padStart(7);
  return Math.abs(value) < 1 ? str : `\x1b[${value < 0 ? 31 : 32}m${str}\x1b[0m`;
};

export async function benchmark({ name, force }: { name: string; force?: boolean }) {
  const ref = isDirty() ? "HEAD" : getRef();
  const cache = (await read())?.default || {};

  let runInputs = inputs;

  if (ref !== "HEAD" && !force) {
    const _cache = cache[ref]?.[name] || {};
    for (const input of inputs) if (_cache[hash(input.value)]) runInputs = runInputs.filter(i => i.name !== input.name);
  }

  if (runInputs.length === 0) {
    console.log(`Results for ${name}/${ref} were already cached. Use --force to re-run.`);
    return;
  }

  build();

  const { tokenizer } = await import(join(pkgDir, "dist", "index.js"));

  const bench = new Bench();

  for (const input of runInputs) {
    bench.add(input.name, () => {
      const iterator = tokenizer(input.value);
      for (;;) {
        const n = iterator.next();
        if (n.done) break;
      }
    });
  }

  await bench.run();

  console.table(bench.table());

  const results: Result[] = bench.tasks.map(t => ({ name: t.name, ...withoutSamples(t.result) }));

  if (ref === "HEAD") {
    const ref = getRef();
    for (const input of inputs) {
      const base = cache[ref]?.[name]?.[hash(input.value)];
      const head = results.find(result => result.name === input.name);
      if (!base || !head) continue;
      const ratio = base.throughput.mean ? (head.throughput.mean / base.throughput.mean - 1) * 100 : null;
      if (ratio) console.log(`${input.name.padEnd(20)}${format(ratio)}`);
    }
  } else {
    cache[ref] ||= {};
    cache[ref][name] ||= {};
    for (const res of results) {
      const input = runInputs.find(i => i.name === res.name);
      if (input) cache[ref][name][hash(input.value)] = res;
    }
    write(cache);
    console.log(`Results for ${name}/${ref} written to ${cacheFile}`);
  }
}

const { values } = parseArgs({ options: { force: { type: "boolean", short: "f" } } });

benchmark({ name: "tokenizer", force: values.force }).catch(console.error);
