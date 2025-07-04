type AnsiCode =
  | {
      type: "SGR";
      code: string;
      description: string;
      template?: string;
      example?: { [key: string]: string };
    }
  | {
      type: "CSI";
      code: string;
      mnemonic: string;
      description: string;
      params?: { [key: string]: string };
      template?: string;
      example?: { [key: string]: string };
    }
  | {
      type: "ESC";
      code: string;
      mnemonic: string;
      description: string;
    }
  | {
      type: "DEC";
      code: string;
      description: string;
      mnemonic?: string;
    }
  | {
      type: "OSC";
      code: string;
      mnemonic: string;
      description: string;
      template?: string;
      example?: { [key: string]: string };
      displayExample?: string;
      end?: {
        description: string;
        template: string;
      };
    };

export const ansiCodes: AnsiCode[] = [
  { type: "SGR", code: "0", description: "reset" },
  { type: "SGR", code: "1", description: "bold" },
  { type: "SGR", code: "2", description: "dim" },
  { type: "SGR", code: "3", description: "italic" },
  { type: "SGR", code: "4", description: "underline" },
  { type: "SGR", code: "5", description: "slow blink" },
  { type: "SGR", code: "6", description: "rapid blink" },
  { type: "SGR", code: "7", description: "reverse video" },
  { type: "SGR", code: "8", description: "conceal" },
  { type: "SGR", code: "9", description: "strike-through" },
  { type: "SGR", code: "21", description: "double underline" },
  { type: "SGR", code: "22", description: "normal (not bold)" },
  { type: "SGR", code: "23", description: "not italic" },
  { type: "SGR", code: "24", description: "not underlined" },
  { type: "SGR", code: "25", description: "not blinking" },
  { type: "SGR", code: "27", description: "not reversed" },
  { type: "SGR", code: "28", description: "reveal" },
  { type: "SGR", code: "29", description: "not strike-through" },
  { type: "SGR", code: "30", description: "black foreground" },
  { type: "SGR", code: "31", description: "red foreground" },
  { type: "SGR", code: "32", description: "green foreground" },
  { type: "SGR", code: "33", description: "yellow foreground" },
  { type: "SGR", code: "34", description: "blue foreground" },
  { type: "SGR", code: "35", description: "magenta foreground" },
  { type: "SGR", code: "36", description: "cyan foreground" },
  { type: "SGR", code: "37", description: "white foreground" },
  { type: "SGR", code: "38;2", description: "set foreground color (24-bit true color)", template: ";<r>;<g>;<b>", example: { r: "255", g: "105", b: "180" } },
  { type: "SGR", code: "38;5", description: "set foreground color (256-color palette)", template: ";<n>", example: { n: "40" } },
  { type: "SGR", code: "39", description: "default foreground color" },
  { type: "SGR", code: "40", description: "black background" },
  { type: "SGR", code: "41", description: "red background" },
  { type: "SGR", code: "42", description: "green background" },
  { type: "SGR", code: "43", description: "yellow background" },
  { type: "SGR", code: "44", description: "blue background" },
  { type: "SGR", code: "45", description: "magenta background" },
  { type: "SGR", code: "46", description: "cyan background" },
  { type: "SGR", code: "47", description: "white background" },
  { type: "SGR", code: "48;2", description: "set background color (24-bit true color)", template: ";<r>;<g>;<b>", example: { r: "255", g: "105", b: "18" } },
  { type: "SGR", code: "48;5", description: "set background color (256-color palette)", template: ";<n>", example: { n: "198" } },
  { type: "SGR", code: "49", description: "default background color" },
  { type: "SGR", code: "52", description: "framed" },
  { type: "SGR", code: "53", description: "overline" },
  { type: "SGR", code: "90", description: "bright black foreground" },
  { type: "SGR", code: "91", description: "bright red foreground" },
  { type: "SGR", code: "92", description: "bright green foreground" },
  { type: "SGR", code: "93", description: "bright yellow foreground" },
  { type: "SGR", code: "94", description: "bright blue foreground" },
  { type: "SGR", code: "95", description: "bright magenta foreground" },
  { type: "SGR", code: "96", description: "bright cyan foreground" },
  { type: "SGR", code: "97", description: "bright white foreground" },
  { type: "SGR", code: "100", description: "bright black background" },
  { type: "SGR", code: "101", description: "bright red background" },
  { type: "SGR", code: "102", description: "bright green background" },
  { type: "SGR", code: "103", description: "bright yellow background" },
  { type: "SGR", code: "104", description: "bright blue background" },
  { type: "SGR", code: "105", description: "bright magenta background" },
  { type: "SGR", code: "106", description: "bright cyan background" },
  { type: "SGR", code: "107", description: "bright white background" },
  { type: "CSI", code: "A", mnemonic: "CUU", description: "cursor up", template: "<n>", example: { n: "5" } },
  { type: "CSI", code: "B", mnemonic: "CUD", description: "cursor down", template: "<n>", example: { n: "5" } },
  { type: "CSI", code: "C", mnemonic: "CUF", description: "cursor forward", template: "<n>", example: { n: "5" } },
  { type: "CSI", code: "D", mnemonic: "CUB", description: "cursor back", template: "<n>", example: { n: "5" } },
  { type: "CSI", code: "E", mnemonic: "CNL", description: "cursor next line", template: "<n>", example: { n: "5" } },
  { type: "CSI", code: "F", mnemonic: "CPL", description: "cursor previous line", template: "<n>", example: { n: "5" } },
  { type: "CSI", code: "G", mnemonic: "CHA", description: "cursor character absolute", template: "<n>", example: { n: "10" } },
  { type: "CSI", code: "H", mnemonic: "CUP", description: "cursor position", template: "<n>;<m>", example: { n: "5", m: "10" } },
  { type: "CSI", code: "J", mnemonic: "ED", description: "erase in display", params: { "0": "erase from cursor to end of screen", "1": "erase from cursor to beginning of screen", "2": "erase entire screen", "3": "erase entire screen and clear scrollback buffer" } },
  { type: "CSI", code: "K", mnemonic: "EL", description: "erase in line", params: { "0": "erase from cursor to end of line", "1": "erase from cursor to beginning of line", "2": "erase entire line" } },
  { type: "CSI", code: "S", mnemonic: "SU", description: "scroll up", template: "<n>", example: { n: "5" } },
  { type: "CSI", code: "T", mnemonic: "SD", description: "scroll down", template: "<n>", example: { n: "5" } },
  { type: "ESC", code: "c", mnemonic: "RIS", description: "reset to initial state" },
  { type: "CSI", code: "f", mnemonic: "HVP", description: "horizontal vertical position", template: "<n>;<m>", example: { n: "5", m: "10" } },
  { type: "CSI", code: "h", mnemonic: "SM", description: "mode" },
  { type: "CSI", code: "l", mnemonic: "RM", description: "remode" },
  { type: "CSI", code: "m", mnemonic: "SGR", description: "select graphic rendition" },
  { type: "CSI", code: "n", mnemonic: "DSR", description: "device status report" },
  { type: "CSI", code: "s", mnemonic: "SCP", description: "save cursor position" },
  { type: "CSI", code: "u", mnemonic: "RCP", description: "restore cursor position" },
  { type: "DEC", code: "1", mnemonic: "DECCKM", description: "cursor keys (application mode)" },
  { type: "DEC", code: "3", mnemonic: "DECCOLM", description: "132 column mode" },
  { type: "DEC", code: "5", mnemonic: "DECSCNM", description: "reverse video mode" },
  { type: "DEC", code: "6", mnemonic: "DECOM", description: "origin mode" },
  { type: "DEC", code: "7", mnemonic: "DECAWM", description: "auto-wrap mode" },
  { type: "DEC", code: "8", mnemonic: "DECARM", description: "auto-wrap mode" },
  { type: "DEC", code: "9", description: "X10 mouse reporting" },
  { type: "DEC", code: "12", description: "start blinking cursor" },
  { type: "DEC", code: "25", mnemonic: "DECTECM", description: "show text cursor" },
  { type: "DEC", code: "47", description: "use alternate screen buffer" },
  { type: "DEC", code: "1000", description: "VT200 mouse reporting" },
  { type: "DEC", code: "1002", description: "button-event mouse reporting" },
  { type: "DEC", code: "1003", description: "any-event mouse reporting" },
  { type: "DEC", code: "1004", description: "send focus in/out events" },
  { type: "DEC", code: "1049", description: "alternate screen buffer (with cursor save/restore)" },
  { type: "DEC", code: "2004", description: "bracketed paste mode" },
  { type: "OSC", code: "0", mnemonic: "OSC 0", description: "set icon name and window title", template: ";<text>", example: { text: "TITLE" } },
  { type: "OSC", code: "1", mnemonic: "OSC 1", description: "set icon name", template: ";<text>", example: { text: "TAB-TITLE" } },
  { type: "OSC", code: "2", mnemonic: "OSC 2", description: "set window title", template: ";<text>", example: { text: "WINDOW-TITLE" } },
  { type: "OSC", code: "4", mnemonic: "OSC 4", description: "change/read palette color number", template: ";<n>;<color>", example: { n: "2", color: "#cccccc" } },
  { type: "OSC", code: "7", mnemonic: "OSC 7", description: "set current working directory", template: ";<path>", example: { path: "file://hostname/path" } },
  { type: "OSC", code: "8", mnemonic: "OSC 8", description: "hyperlink", template: ";<params>;<url>", example: { params: "id=1", url: "https://example.com" }, displayExample: `<a href="http://example.org" target="_blank" rel="noopener">text</a>`, end: { description: "hyperlink (end)", template: ";;" } },
  { type: "OSC", code: "9", mnemonic: "OSC 9", description: "notification", template: ";<message>", example: { message: "hello there" } },
  { type: "OSC", code: "10", mnemonic: "OSC 10", description: "set default text foreground color", template: ";<color>", example: { color: "#ff0000" } },
  { type: "OSC", code: "11", mnemonic: "OSC 11", description: "set default text background color", template: ";<color>", example: { color: "#0000ff" } },
  { type: "OSC", code: "12", mnemonic: "OSC 12", description: "set text cursor color", template: ";<color>", example: { color: "#00ff00" } },
  { type: "OSC", code: "52", mnemonic: "OSC 52", description: "manipulate clipboard", template: ";<c>;<data>", example: { c: "c", data: "YmFzZTY0" } },
  { type: "OSC", code: "104", mnemonic: "OSC 104", description: "reset palette colors" },
  { type: "OSC", code: "777", mnemonic: "OSC 777", description: "rxvt extension", template: ";notify;<title>;<body>", example: { title: "title", body: "body" } },
];

export const sgrMap = new Map<string, Extract<AnsiCode, { type: "SGR" }>>();
export const csiMap = new Map<string, Extract<AnsiCode, { type: "CSI" }>>();
export const oscMap = new Map<string, Extract<AnsiCode, { type: "OSC" }>>();
export const decMap = new Map<string, Extract<AnsiCode, { type: "DEC" }>>();
export const escMap = new Map<string, Extract<AnsiCode, { type: "ESC" }>>();

for (const code of ansiCodes) {
  switch (code.type) {
    case "SGR":
      sgrMap.set(code.code, code);
      break;
    case "CSI":
      csiMap.set(code.code, code);
      break;
    case "OSC":
      oscMap.set(code.code, code);
      break;
    case "DEC":
      decMap.set(code.code, code);
      break;
    case "ESC":
      escMap.set(code.code, code);
      break;
  }
}
