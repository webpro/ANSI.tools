import { execSync } from "node:child_process";
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({ options: { force: { type: "boolean" } }, allowPositionals: true });
const sh = (cmd: string) => execSync(cmd, { cwd: root, encoding: "utf8", stdio: "pipe" }).trim();
const root = resolve(dirname(new URL(import.meta.url).pathname), "..");
const cache = resolve(root, "bench/results");
if (!existsSync(cache)) mkdirSync(cache);
const tags = () =>
  sh("git tag -l --sort=version:refname")
    .split("\n")
    .filter(t => /^\d+\.\d+\.\d+$/.test(t));

function resolveRefs(): string[] {
  if (positionals.length === 1 && positionals[0].includes("...")) {
    const [from, to] = positionals[0].split("...");
    const all = tags();
    const sliced = all.slice(from ? all.indexOf(from) : 0, to && to !== "HEAD" ? all.indexOf(to) + 1 : undefined);
    return !to || to === "HEAD" ? [...sliced, "HEAD"] : sliced;
  }
  if (positionals.length >= 2) return positionals;
  return [sh("git describe --tags --abbrev=0"), "HEAD"];
}

type BenchResult = {
  benchmarks: Array<{
    alias: string;
    runs: Array<{ stats: { min: number }; name: string }>;
  }>;
};

const benchName = (b: BenchResult["benchmarks"][number]) => b.alias ?? b.runs[0].name;

function bench(ref: string): BenchResult {
  const file = resolve(cache, `${ref}.json`);
  if (!values.force && ref !== "HEAD" && existsSync(file)) {
    const cached = JSON.parse(readFileSync(file, "utf8"));
    if (Array.isArray(cached?.benchmarks)) return cached;
  }
  console.error(`▸ ${ref}`);
  sh(`git checkout ${ref} -- src/`);
  try {
    sh(`node bench/run.ts ${file} 2>/dev/null`);
    return JSON.parse(readFileSync(file, "utf8"));
  } finally {
    sh("git checkout HEAD -- src/");
  }
}

const all = resolveRefs().map(ref => ({ ref, results: bench(ref) }));
const names = all[0].results.benchmarks.map(benchName);
const url = new URL("/", "https://try.venz.dev");
url.searchParams.set("type", "line");
url.searchParams.set("pivot", "1");
url.searchParams.set("labelY", "min ms");
for (const r of all) url.searchParams.append("label", r.ref);
for (const n of names) url.searchParams.append("l", n);
for (const r of all) {
  const data = names.map(n => {
    const b = r.results.benchmarks.find(b => benchName(b) === n);
    return b ? +(b.runs[0].stats.min / 1_000_000).toFixed(2) : 0;
  });
  url.searchParams.append("data", data.join(","));
}
console.log(url.href);
