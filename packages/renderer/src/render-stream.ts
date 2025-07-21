import {Writable, WritableOptions} from "node:stream";
import {Renderer} from "./renderer.ts";
import {parse} from "@ansi-tools/parser";

export class RenderStream extends Writable {
  public get isRenderStream(): boolean {
    return true;
  }

  public get renderer(): Renderer {
    return this.#renderer;
  }

  #buffer: string[] = [];
  #renderer: Renderer = new Renderer();

  constructor(opts?: WritableOptions) {
    super(opts);

    this.on('end', () => {
      this.#updateRenderer();
    });
  }

  _write(
    chunk: unknown,
    _encoding: BufferEncoding,
    callback: (error?: Error | null | undefined) => void
  ): void {
    this.#buffer.push(String(chunk));
    callback();
  }

  #updateRenderer(): void {
    const ast = parse(this.#buffer.join(''));

    for (const code of ast) {
      this.#renderer.write(code);
    }
  }
}
