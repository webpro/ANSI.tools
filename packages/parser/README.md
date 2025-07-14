# @ansi-tools/parser

Parser for ANSI escape sequences.

## Supported sequence types

- **CSI** (Control Sequence Introducer): `\x1b[...`
- **OSC** (Operating System Command): `\x1b]...`
- **DCS** (Device Control String): `\x1bP...`
- **ESC** (Escape): `\x1b...`
- **DEC** (DEC Private Mode): `\x1b[?...`
- **STRING** (APC/PM/SOS): `\x1b_...`, `\x1b^...`, `\x1bX...`
- **PRIVATE** (Private sequences): `\x1b[<...`, `\x1b[=...`, `\x1b[>...`

## Features

- ✅ Handles 7-bit (`\x1b` or `\u001b`) and 8-bit (`\u009b`) introducers
- ✅ Handles octal (`\033`) and shorthand `\e` introducers (only escaped)
- ✅ Multiple string terminators (`\x1b\\`, `\x07`)
- ✅ Zero dependencies
- ✅ Separate optimized modules for raw and escaped input

Used by [ansi.tools](https://ansi.tools).

## Installation

```bash
npm install @ansi-tools/parser
```

## Usage

```ts
import { parse } from "@ansi-tools/parser";

const input = "\x1b[31mHello\x1b[0m World";

for (const code of parse(input)) {
  console.log(code);
}
```

There is a difference between escaped and unescaped input. Only with an escaped
input string the raw input and the positions can be preserved in the tokens and
control codes. See the example below for the default and the `/escaped` import.

The default and unescaped tokenization is roughly ~30% faster. Use this default
if you just need the control codes.

## Examples

### Default (raw/unescaped)

```ts
import { parse } from "@ansi-tools/parser";

parse(`\x1b[31mHello\x1b[0m`);

// result:
[
  {
    type: "CSI",
    pos: 0,
    raw: "\u001b[31m",
    command: "m",
    params: ["31"],
  },
  {
    type: "TEXT",
    pos: 5,
    raw: "Hello",
  },
  {
    type: "CSI",
    pos: 10,
    raw: "\u001b[0m",
    command: "m",
    params: ["0"],
  },
];
```

### Escaped

```ts
import { parse } from "@ansi-tools/parser/escaped";

parse(String.raw`\x1b[31mHello\x1b[0m`);

// result:
[
  {
    type: "CSI",
    pos: 0,
    raw: "\\x1b[31m",
    command: "m",
    params: ["31"],
  },
  {
    type: "TEXT",
    pos: 8,
    raw: "Hello",
  },
  {
    type: "CSI",
    pos: 13,
    raw: "\\x1b[0m",
    command: "m",
    params: ["0"],
  },
];
```

## Tokenizer & generators

The tokenizer and generators are also available, for both the default and the
`/escaped` versions.

### tokenize

```ts
import { tokenize } from "@ansi-tools/parser";

const input = "\x1b[31m";

for (const token of tokenize(input)) {
  console.log(token);
}
```

### Generators

```ts
import { tokenizer, parser } from "@ansi-tools/parser";

const input = "\x1b[31mHello\x1b[0m";

const tokens = tokenizer(input);

const codes = parser(tokens);

for (const code of codes) {
  console.log(code);
}
```

## Type Definitions

```ts
function tokenize(input: string): TOKEN[];
function parse(input: string): CODE[];

function* tokenizer(input: string): Generator<TOKEN>;
function* parser(tokens: Generator<TOKEN>): Generator<CODE>;
```

### CODE

```ts
type CONTROL_CODE = {
  type: "CSI" | "DCS" | "DEC" | "ESC" | "OSC" | "SGR" | "STRING" | "PRIVATE";
  command: string;
  raw: string;
  params: string[];
  pos: number;
};

type CONTROL_CODE_TEXT = {
  type: "TEXT";
  raw: string;
  pos: number;
};

type CODE = CONTROL_CODE | CONTROL_CODE_TEXT;
```

### TOKEN

```ts
type TOKEN = {
  type: "INTRODUCER" | "DATA" | "FINAL" | "TEXT";
  pos: number;
  raw: string;
  code?: string;
  intermediate?: string;
};
```

## License

ISC
