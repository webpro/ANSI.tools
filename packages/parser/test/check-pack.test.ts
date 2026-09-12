import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, delimiter } from "node:path";
import { test } from "node:test";

for (const format of ["array", "keyed"] as const) {
  test(`check-pack accepts npm ${format} JSON output`, t => {
    const directory = mkdtempSync(join(tmpdir(), "ansi-check-pack-"));
    t.after(() => rmSync(directory, { recursive: true, force: true }));
    const packed = { name: "@ansi-tools/parser", entryCount: 8, unpackedSize: 100 };
    const output = format === "array" ? [packed] : { "@ansi-tools/parser": packed };
    writeFileSync(
      join(directory, "npm"),
      `#!/usr/bin/env node\nconsole.log(JSON.stringify(process.argv[2] === "pack" ? ${JSON.stringify(output)} : {dist:{fileCount:8,unpackedSize:100}}));\n`,
      { mode: 0o755 }
    );
    const result = spawnSync(process.execPath, [new URL("../scripts/check-pack.ts", import.meta.url).pathname], {
      env: { ...process.env, PATH: directory + delimiter + process.env.PATH },
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stderr, /8 files \/ 100 B vs published 8 \/ 100 B \(\+0\.0%\)/);
  });
}
