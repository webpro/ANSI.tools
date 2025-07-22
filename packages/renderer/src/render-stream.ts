import {Writable, WritableOptions} from "node:stream";
import {Renderer} from "./renderer.ts";
import {parse} from "@ansi-tools/parser";

const renderStreamBrand = Symbol.for('ansi-tools:render-stream');

export class RenderStream extends Writable {
  [renderStreamBrand] = true;

  get renderer(): Renderer {
    const ast = parse(this.#buffer.join(''));
    const renderer = new Renderer();

    for (const code of ast) {
      renderer.write(code);
    }

    return renderer;
  }

  #buffer: string[] = [];

  constructor(opts?: WritableOptions) {
    super(opts);
  }

  _write(
    chunk: unknown,
    _encoding: BufferEncoding,
    callback: (error?: Error | null | undefined) => void
  ): void {
    this.#buffer.push(String(chunk));
    callback();
  }
}
