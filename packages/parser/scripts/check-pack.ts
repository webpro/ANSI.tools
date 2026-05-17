import { execFileSync } from "node:child_process";

const run = (args: string[], timeout?: number) =>
  execFileSync("npm", args, {
    cwd: new URL("..", import.meta.url).pathname,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    timeout,
  });

const { name, entryCount, unpackedSize } = JSON.parse(run(["pack", "--dry-run", "--json", "--ignore-scripts"]))[0];

let base: { fileCount: number; unpackedSize: number } | undefined;
try {
  const v = JSON.parse(run(["view", `${name}@latest`, "--json"], 15_000));
  base = (Array.isArray(v) ? v.at(-1) : v).dist;
} catch {
  /* offline / never published */
}

if (!base) {
  console.error(`check-pack: no published baseline. ${entryCount} files / ${unpackedSize} B, proceeding.`);
  process.exit(0);
}

const pct = ((unpackedSize - base.unpackedSize) / base.unpackedSize) * 100;
console.error(
  `check-pack: ${entryCount} files / ${unpackedSize} B vs published ${base.fileCount} / ${base.unpackedSize} B (${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%).`
);

if ((entryCount !== base.fileCount || pct > 10) && process.stdin.isTTY) {
  process.stderr.write("check-pack: change detected. Press Enter to proceed (Ctrl-C to abort): ");
  await new Promise<void>(resolve => {
    const done = () => resolve();
    process.stdin.once("data", done).once("end", done);
  });
}

process.exit(0);
