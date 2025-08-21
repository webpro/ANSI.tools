# bench

From `packages/parser`:

```sh
node bench/index.ts
```

- Add inputs to `bench/inputs.ts` as needed (and commit)
- Run with clean git status re. tracked files to create `tmp/bench.json` folder
  for baseline
- With git unstaged changes ("dirty"), run to compare against baseline (rinse &
  repeat)
- Just delete `tmp/bench.json` to reset.
