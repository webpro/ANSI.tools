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
  { type: "SGR", code: "4:0", description: "no underline" },
  { type: "SGR", code: "4:1", description: "single underline" },
  { type: "SGR", code: "4:2", description: "double underline" },
  { type: "SGR", code: "4:3", description: "curly underline" },
  { type: "SGR", code: "4:4", description: "dotted underline" },
  { type: "SGR", code: "4:5", description: "dashed underline" },
  { type: "SGR", code: "5", description: "slow blink" },
  { type: "SGR", code: "6", description: "rapid blink" },
  { type: "SGR", code: "7", description: "reverse video" },
  { type: "SGR", code: "8", description: "conceal" },
  { type: "SGR", code: "9", description: "strike-through" },
  { type: "SGR", code: "21", description: "double underline" },
  { type: "SGR", code: "22", description: "reset bold" },
  { type: "SGR", code: "23", description: "reset italic" },
  { type: "SGR", code: "24", description: "reset underlined" },
  { type: "SGR", code: "25", description: "reset blinking" },
  { type: "SGR", code: "27", description: "reset reversed video" },
  { type: "SGR", code: "28", description: "reveal" },
  { type: "SGR", code: "29", description: "reset strike-through" },
  { type: "SGR", code: "30", description: "black foreground" },
  { type: "SGR", code: "31", description: "red foreground" },
  { type: "SGR", code: "32", description: "green foreground" },
  { type: "SGR", code: "33", description: "yellow foreground" },
  { type: "SGR", code: "34", description: "blue foreground" },
  { type: "SGR", code: "35", description: "magenta foreground" },
  { type: "SGR", code: "36", description: "cyan foreground" },
  { type: "SGR", code: "37", description: "white foreground" },
  { type: "SGR", code: "38;2", description: "set fg color (24-bit true color)", template: ";<r>;<g>;<b>", example: { r: "255", g: "105", b: "180" } },
  { type: "SGR", code: "38;5", description: "set fg color (256-color palette)", template: ";<n>", example: { n: "40" } },
  { type: "SGR", code: "39", description: "default fg color" },
  { type: "SGR", code: "40", description: "black background" },
  { type: "SGR", code: "41", description: "red background" },
  { type: "SGR", code: "42", description: "green background" },
  { type: "SGR", code: "43", description: "yellow background" },
  { type: "SGR", code: "44", description: "blue background" },
  { type: "SGR", code: "45", description: "magenta background" },
  { type: "SGR", code: "46", description: "cyan background" },
  { type: "SGR", code: "47", description: "white background" },
  { type: "SGR", code: "48;2", description: "set bg color (24-bit true color)", template: ";<r>;<g>;<b>", example: { r: "255", g: "105", b: "18" } },
  { type: "SGR", code: "48;5", description: "set bg color (256-color palette)", template: ";<n>", example: { n: "198" } },
  { type: "SGR", code: "58;2", description: "set underline color (24-bit true color)", template: ";<r>;<g>;<b>", example: { r: "255", g: "105", b: "18" } },
  { type: "SGR", code: "58;5", description: "set underline color (256-color palette)", template: ";<n>", example: { n: "198" } },
  { type: "SGR", code: "49", description: "default bg color" },
  { type: "SGR", code: "51", description: "framed" },
  { type: "SGR", code: "52", description: "encircled" },
  { type: "SGR", code: "53", description: "overline" },
  { type: "SGR", code: "54", description: "not framed or encircled" },
  { type: "SGR", code: "55", description: "not overlined" },
  { type: "SGR", code: "73", description: "superscript" },
  { type: "SGR", code: "74", description: "subscript" },
  { type: "SGR", code: "75", description: "reset super/subscript" },
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
  { type: "ESC", code: "P", mnemonic: "DCS", description: "device control string" },
  { type: "ESC", code: "=", mnemonic: "DECPAM", description: "application keypad" },
  { type: "ESC", code: ">", mnemonic: "DECPNM", description: "normal keypad" },
  { type: "ESC", code: "#8", mnemonic: "DECALN", description: "screen alignment pattern" },
  { type: "ESC", code: "D", mnemonic: "IND", description: "index" },
  { type: "ESC", code: "E", mnemonic: "NEL", description: "next line" },
  { type: "ESC", code: "H", mnemonic: "HTS", description: "horizontal tab set" },
  { type: "ESC", code: "M", mnemonic: "RI", description: "reverse index" },
  { type: "ESC", code: "Z", mnemonic: "DECID", description: "identify device" },
  { type: "ESC", code: "c", mnemonic: "RIS", description: "reset to initial state" },
  { type: "ESC", code: "7", mnemonic: "DECSC", description: "save cursor position" },
  { type: "ESC", code: "8", mnemonic: "DECRC", description: "restore cursor position" },
  { type: "CSI", code: "@", mnemonic: "ICH", description: "insert characters", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "A", mnemonic: "CUU", description: "cursor up", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "B", mnemonic: "CUD", description: "cursor down", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "C", mnemonic: "CUF", description: "cursor forward", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "D", mnemonic: "CUB", description: "cursor back", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "E", mnemonic: "CNL", description: "cursor next line", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "F", mnemonic: "CPL", description: "cursor previous line", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "G", mnemonic: "CHA", description: "cursor character absolute", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "H", mnemonic: "CUP", description: "cursor position", template: "<n>;<m>", example: { n: "1", m: "1" } },
  { type: "CSI", code: "I", mnemonic: "CHT", description: "cursor horizontal tabulation", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "J", mnemonic: "ED", description: "erase", params: { "0": "from cursor to end of screen", "1": "from cursor to beginning of screen", "2": "entire screen", "3": "entire screen and clear scrollback buffer" } },
  { type: "CSI", code: "K", mnemonic: "EL", description: "erase", params: { "0": "from cursor to end of line", "1": "from cursor to beginning of line", "2": "entire line" } },
  { type: "CSI", code: "L", mnemonic: "IL", description: "insert lines", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "M", mnemonic: "DL", description: "delete lines", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "P", mnemonic: "DCH", description: "delete characters", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "S", mnemonic: "SU", description: "scroll up (pan down)", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "T", mnemonic: "SD", description: "scroll down (pan up)", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "X", mnemonic: "ECH", description: "erase characters", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "Z", mnemonic: "CBT", description: "cursor backward tabulation", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "`", mnemonic: "HPA", description: "horizontal position absolute", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "a", mnemonic: "HPR", description: "horizontal position relative", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "c", mnemonic: "DA", description: "device attributes", params: { "0": "request primary device attributes" } },
  { type: "CSI", code: "d", mnemonic: "VPA", description: "vertical position absolute", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "e", mnemonic: "VPR", description: "vertical position relative", template: "<n>", example: { n: "1" } },
  { type: "CSI", code: "f", mnemonic: "HVP", description: "horizontal vertical position", template: "<n>;<m>", example: { n: "1", m: "1" } },
  { type: "CSI", code: "h", mnemonic: "SM", description: "set mode", params: { "4": "insert mode (IRM)", "20": "automatic newline (LNM)" } },
  { type: "CSI", code: "l", mnemonic: "RM", description: "reset mode", params: { "4": "replace mode (IRM)", "20": "normal linefeed (LNM)" } },
  { type: "CSI", code: "m", mnemonic: "SGR", description: "select graphic rendition" },
  { type: "CSI", code: "n", mnemonic: "DSR", description: "device status report", params: { "5": "status report", "6": "report cursor position", R: "report cursor position response", "0": "ready" } },
  { type: "CSI", code: "r", mnemonic: "DECSTBM", description: "set scrolling region", template: "<t>;<b>", example: { t: "1", b: "24" } },
  { type: "CSI", code: "s", mnemonic: "SCP", description: "save cursor position" },
  { type: "CSI", code: "u", mnemonic: "RCP", description: "restore cursor position" },
  { type: "DEC", code: "1", mnemonic: "DECCKM", description: "cursor key to application" },
  { type: "DEC", code: "2", mnemonic: "DECANM", description: "ANSI mode" },
  { type: "DEC", code: "3", mnemonic: "DECCOLM", description: "number of columns to 132" },
  { type: "DEC", code: "4", mnemonic: "DECSCLM", description: "smooth scrolling" },
  { type: "DEC", code: "5", mnemonic: "DECSCNM", description: "screen mode to reverse video" },
  { type: "DEC", code: "6", mnemonic: "DECOM", description: "origin mode to relative" },
  { type: "DEC", code: "7", mnemonic: "DECAWM", description: "auto-wrap mode" },
  { type: "DEC", code: "8", mnemonic: "DECARM", description: "auto-repeat keys" },
  { type: "DEC", code: "9", description: "X10 mouse reporting" },
  { type: "DEC", code: "12", description: "blinking cursor" },
  { type: "DEC", code: "25", mnemonic: "DECTCEM", description: "show cursor" },
  { type: "DEC", code: "47", description: "alternate screen buffer" },
  { type: "DEC", code: "1000", description: "VT200 mouse reporting" },
  { type: "DEC", code: "1001", description: "X11 mouse reporting" },
  { type: "DEC", code: "1002", description: "button-event mouse reporting" },
  { type: "DEC", code: "1003", description: "any-event mouse reporting" },
  { type: "DEC", code: "1004", description: "focus in/out events" },
  { type: "DEC", code: "1005", description: "UTF-8 mouse mode" },
  { type: "DEC", code: "1006", description: "SGR mouse mode" },
  { type: "DEC", code: "1007", description: "urxvt extended mouse mode" },
  { type: "DEC", code: "1015", description: "urxvt mouse mode" },
  { type: "DEC", code: "1016", description: "SGR mouse pixel mode" },
  { type: "DEC", code: "1034", description: "8-bit meta key" },
  { type: "DEC", code: "1035", description: "numeric keypad meta key" },
  { type: "DEC", code: "1036", description: "alternate key modifiers" },
  { type: "DEC", code: "1037", description: "delete key to send DEL" },
  { type: "DEC", code: "1039", description: "alternate backspace" },
  { type: "DEC", code: "1042", description: "bell to urgent" },
  { type: "DEC", code: "1043", description: "meta key in alternate mode" },
  { type: "DEC", code: "1047", description: "alternate screen mode" },
  { type: "DEC", code: "1048", description: "extended cursor mode" },
  { type: "DEC", code: "1049", description: "alternate screen buffer (with cursor save/restore)" },
  { type: "DEC", code: "1050", description: "termcap/terminfo special keys" },
  { type: "DEC", code: "1051", description: "Sun function keys" },
  { type: "DEC", code: "1052", description: "HP function keys" },
  { type: "DEC", code: "1053", description: "SCO function keys" },
  { type: "DEC", code: "1060", description: "legacy xterm keys" },
  { type: "DEC", code: "1061", description: "VT220 keyboard" },
  { type: "DEC", code: "2004", description: "bracketed paste mode" },
  { type: "OSC", code: "0", mnemonic: "OSC 0", description: "set window title and icon name", template: ";<text>", example: { text: "title" } },
  { type: "OSC", code: "1", mnemonic: "OSC 1", description: "set icon name", template: ";<text>", example: { text: "icon" } },
  { type: "OSC", code: "2", mnemonic: "OSC 2", description: "set window title", template: ";<text>", example: { text: "title" } },
  { type: "OSC", code: "4", mnemonic: "OSC 4", description: "set/read palette color", template: ";<n>;<color-spec>", example: { n: "11", "color-spec": "rgb:00/ff/00" } },
  { type: "OSC", code: "7", mnemonic: "OSC 7", description: "set current working directory", template: ";<url>", example: { url: "file://hostname/path" } },
  { type: "OSC", code: "8", mnemonic: "OSC 8", description: "hyperlink", template: ";<params>;<url>", example: { params: "id=1", url: "https://example.com" }, end: { description: "hyperlink (end)", template: "" } },
  { type: "OSC", code: "9", mnemonic: "OSC 9", description: "send notification", template: ";<message>", example: { message: "hello there" } },
  { type: "OSC", code: "10", mnemonic: "OSC 10", description: "set/read text foreground color", template: ";<color-spec>", example: { "color-spec": "rgb:ff/00/00" } },
  { type: "OSC", code: "11", mnemonic: "OSC 11", description: "set/read text background color", template: ";<color-spec>", example: { "color-spec": "rgb:00/00/ff" } },
  { type: "OSC", code: "12", mnemonic: "OSC 12", description: "set/read text cursor color", template: ";<color-spec>", example: { "color-spec": "rgb:00/ff/00" } },
  { type: "OSC", code: "52", mnemonic: "OSC 52", description: "manipulate clipboard", template: ";<c>;<data>", example: { c: "c", data: "YmFzZTY0" } },
  { type: "OSC", code: "104", mnemonic: "OSC 104", description: "reset palette color", template: ";<n>", example: { n: "11" } },
  { type: "OSC", code: "777", mnemonic: "OSC 777", description: "send notification (rxvt-unicode)", template: ";notify;<title>;<body>", example: { title: "subject", body: "hello" } },
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
