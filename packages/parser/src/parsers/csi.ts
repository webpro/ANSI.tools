import { CODE_TYPES } from "../constants.ts";
import type { CODE, TOKEN } from "../types.ts";

export function parseCSI(introducer: TOKEN, dataTokens: TOKEN[], final: TOKEN | undefined): CODE {
  const data = dataTokens.map(t => t.raw).join("");
  const raw = introducer.raw + data + (final?.raw || "");
  const params = [];
  let intermediates = "";
  if (data) {
    let i = 0;
    let paramSection = "";
    // Parameters are bytes 0x30-0x3f (0-9:;<=>?)
    while (i < data.length && data.charCodeAt(i) >= 0x30 && data.charCodeAt(i) <= 0x3f) {
      paramSection += data[i];
      i++;
    }
    intermediates = data.slice(i);
    if (paramSection) {
      const parts = paramSection.replace(/:/g, ";").split(";");
      for (const part of parts) {
        params.push(part || "-1");
      }
    }
  }
  const command = intermediates + (final?.raw ?? "");

  if (command === "m" && params.length === 5 && params[1] === "2" && (params[0] === "38" || params[0] === "48")) {
    params.splice(2, 0, "0");
  }

  return { type: CODE_TYPES.CSI, pos: introducer.pos, raw, command, params };
}

export function parsePrivateCSI(introducer: TOKEN, dataTokens: TOKEN[], finalToken: TOKEN | undefined): CODE {
  const data = dataTokens.map(t => t.raw).join("");
  const raw = introducer.raw + data + (finalToken?.raw ?? "");
  const privateIndicator = data[0] || "";
  const withoutIndicator = data.slice(1);
  const match = withoutIndicator.match(/^([\d;:]*)(.*)/);
  const paramsRaw = match?.[1] ?? "";
  const intermediates = match?.[2] ?? "";
  const command = `${privateIndicator}${intermediates}${finalToken?.raw ?? ""}`;
  const params = [];
  if (paramsRaw) {
    let current = "";
    for (let i = 0; i < paramsRaw.length; i++) {
      if (paramsRaw[i] === ";") {
        params.push(current || "-1");
        current = "";
      } else {
        current += paramsRaw[i];
      }
    }
    params.push(current || "-1");
  }

  return { type: CODE_TYPES.PRIVATE, pos: introducer.pos, raw, command, params };
}
