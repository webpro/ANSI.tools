# @ansi-tools/renderer

Renders strings containing ANSI codes (i.e. terminal output) into a "rendered"
representation, containing each visual frame which would have been displayed.

## Installation

```bash
npm install @ansi-tools/renderer
```

## Usage

```ts
import { renderString } from "@ansi-tools/renderer";

const input = "\x1b[31mHello\x1b[0m World";
const rendered = renderString(input);

for (const frame of rendered) {
  // will render frame 1 which is "Hello World"
  console.log(frame);
}
```

## License

ISC
