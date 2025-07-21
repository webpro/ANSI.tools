import {CODE, CONTROL_CODE, parse} from "@ansi-tools/parser";
import {isCursorCommand, isEraseCommand} from "./commands.ts";

export class Renderer {
  #buffer: string[] = [];
  #cursorX: number = 0;
  #cursorY: number = 0;
  #frames: string[] = [];
  #savedCursor?: [number, number];
  #frameWritesEnabled: boolean = true;

  static fromString(input: string): Renderer {
    const ast = parse(input);
    const renderer = new Renderer();

    for (const code of ast) {
      renderer.write(code);
    }

    return renderer;
  }

  get frames(): string[] {
    return [
      ...this.#frames,
      this.#buffer.join('\n')
    ];
  }

  get cursor(): [x: number, y: number] {
    return [this.#cursorX, this.#cursorY];
  }

  get line(): string {
    return this.#buffer[this.#cursorY] || '';
  }

  saveCursor(): void {
    this.#savedCursor = [this.#cursorX, this.#cursorY];
  }

  restoreCursor(): void {
    if (this.#savedCursor) {
      this.cursorTo(this.#savedCursor[0], this.#savedCursor[1]);
    }
  }

  cursorUp(count: number): void {
    this.#cursorY = Math.max(0, this.#cursorY - count);
  }

  cursorDown(count: number): void {
    this.#cursorY = Math.min(this.#buffer.length - 1, this.#cursorY + count);
  }

  cursorTo(x: number, y: number): void {
    this.#cursorY = Math.max(0, Math.min(this.#buffer.length - 1, y));
    this.#cursorX = Math.max(0, Math.min(this.line.length - 1, x));
  }

  cursorForward(count: number): void {
    this.#cursorX = Math.min(this.line.length - 1, this.#cursorX + count);
  }

  cursorBackward(count: number): void {
    this.#cursorX = Math.max(0, this.#cursorX - count);
  }

  writeText(text: string): void {
    const parts = text.split('\n');

    if (parts.length === 0) {
      return;
    }

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const bufferIndex = this.#cursorY + i;
      const isFirst = i === 0;
      const isLast = i === parts.length - 1;
      const existingLine = this.#buffer[bufferIndex];

      if (existingLine !== undefined) {
        if (isFirst) {
          const prefix = existingLine.slice(0, this.#cursorX + 1);
          this.#buffer[bufferIndex] = prefix + part;
          this.cursorForward(part.length);
        } else if (isLast) {
          const suffix = existingLine.slice(this.#cursorX);
          this.#buffer[bufferIndex] = part + suffix;
          this.cursorTo(part.length, bufferIndex);
        } else {
          this.#buffer[bufferIndex] = part;
          this.cursorTo(0, bufferIndex);
        }
      } else {
        this.#buffer.push(part);
        this.cursorTo(0, bufferIndex);
      }
    }
  }

  cursorByCommand(code: CONTROL_CODE): void {
    if (code.type === 'DEC' &&
      (code.command === 'l' || code.command === 'h')) {
      // Ignore cursor hide/show
      return;
    }
    if (code.type === 'CSI' && (
      code.command === 'T' || code.command === 'S')) {
      // Ignore scroll commands
      return;
    }
    if (code.type === 'ESC') {
      if (code.command === '8') {
        this.saveCursor();
      } else if (code.command === '7') {
        this.restoreCursor();
      }
      return;
    }

    if (code.command === 'H') {
      this.cursorTo(
        code.params[0] ? parseInt(code.params[0]) - 1 : 0,
        code.params[1] ? parseInt(code.params[1]) - 1 : 0
      );
      return;
    }

    const multiplier = code.params[0] ? parseInt(code.params[0]) : 1;

    switch (code.command) {
      case 'A':
        this.cursorUp(multiplier);
        break;
      case 'B':
        this.cursorDown(multiplier);
        break;
      case 'C':
        this.cursorForward(multiplier);
        break;
      case 'D':
        this.cursorBackward(multiplier);
        break;
      case 'E':
        this.cursorTo(0, this.#cursorY + multiplier);
        break;
      case 'F':
        this.cursorTo(0, this.#cursorY - multiplier);
        break;
      case 'G':
        this.cursorTo(multiplier - 1, this.#cursorY);
        break;
    }
  }

  eraseAll(): void {
    this.#pushFrame();
    this.#buffer = [];
    this.cursorTo(0, 0);
  }

  #pushFrame(): void {
    if (!this.#frameWritesEnabled) {
      return;
    }
    this.#frames.push(this.#buffer.join('\n'));
  }

  eraseLine(): void {
    this.#pushFrame();
    this.#buffer[this.#cursorY] = '';
    this.cursorTo(0, this.#cursorY);
  }

  eraseToEndOfLine(): void {
    this.#pushFrame();
    const line = this.#buffer[this.#cursorY];

    if (line === undefined) {
      return;
    }

    this.#buffer[this.#cursorY] = line.slice(0, this.#cursorX);
  }

  eraseToStartOfLine(): void {
    this.#pushFrame();
    const line = this.#buffer[this.#cursorY];

    if (line === undefined) {
      return;
    }

    this.#buffer[this.#cursorY] = ' '.repeat(this.#cursorX) + line.slice(this.#cursorX);
  }

  eraseToEnd(): void {
    this.#pushFrame();
    this.#frameWritesEnabled = false;
    this.eraseToEndOfLine();
    this.#frameWritesEnabled = true;
    this.#buffer.splice(this.#cursorY + 1);
  }

  eraseToStart(): void {
    this.#pushFrame();
    this.#frameWritesEnabled = false;
    this.eraseToStartOfLine();
    this.#frameWritesEnabled = true;
    this.#buffer.splice(0, this.#cursorY);
    this.cursorTo(this.#cursorX, 0);
  }

  eraseByCommand(code: CONTROL_CODE): void {
    if (code.type === 'ESC' && code.command === 'c') {
      this.eraseAll();
      return;
    }
    const flag = code.params[0] ? parseInt(code.params[0]) : 0;
    if (code.command === 'J') {
      switch (flag) {
        case 0:
          this.eraseToEnd();
          break;
        case 1:
          this.eraseToStart();
          break;
        case 2:
          this.eraseAll();
          break;
      }
    } else if (code.command === 'K') {
      switch (flag) {
        case 0:
          this.eraseToEndOfLine();
          break;
        case 1:
          this.eraseToStartOfLine();
          break;
        case 2:
          this.eraseLine();
          break;
      }
    }
  }

  write(code: CODE): void {
    if (isCursorCommand(code)) {
      this.cursorByCommand(code);
    } else if (isEraseCommand(code)) {
      this.eraseByCommand(code);
    } else if (code.type === 'TEXT') {
      this.writeText(code.raw);
    }
  }
}
