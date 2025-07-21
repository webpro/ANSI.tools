import {Renderer} from "./renderer.ts";
import {RenderStream} from "./render-stream.ts";

export async function renderString(input: string): Promise<Renderer> {
  return Renderer.fromString(input);;
}

export function createRenderStream(): RenderStream {
  return new RenderStream();
}

export { Renderer };
