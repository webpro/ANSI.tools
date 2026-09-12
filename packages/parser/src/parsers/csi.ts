import { CODE_TYPES } from "../constants.ts";
import type { CODE, CONTROL_CODE_TYPE, TOKEN } from "../types.ts";
import { join, joinData } from "./data.ts";

export function parseCSI(introducer: TOKEN, dataTokens: TOKEN[], final: TOKEN | undefined): CODE {
  const data = joinData(dataTokens);
  const finalRaw = final?.raw ?? "";
  const raw = introducer.raw + join(dataTokens) + finalRaw;
  const params: string[] = [];

  let type: CONTROL_CODE_TYPE = CODE_TYPES.CSI;
  let paramEnd = 0;
  let needsGroups = false;
  let parameterGroups: string[][] | undefined;
  let privatePrefixIndex = -1;
  let privateParameterIndex = -1;

  if (data) {
    while (paramEnd < data.length) {
      const charCode = data.charCodeAt(paramEnd);
      if (charCode < 0x30 || charCode > 0x3f) break;
      paramEnd++;
    }
  }

  const paramSection = paramEnd > 0 ? data.substring(0, paramEnd) : "";
  const intermediates = paramEnd < data.length ? data.substring(paramEnd) : "";

  if (paramSection) {
    const length = paramSection.length;
    let start = 0;
    for (let i = 0; i <= length; i++) {
      const charCode = i < length ? paramSection.charCodeAt(i) : 0x3b;
      if (charCode !== 0x3b && charCode !== 0x3a) continue;
      if (i === start || charCode === 0x3a) needsGroups = true;
      if (i > start && privatePrefixIndex === -1) {
        const opener = paramSection.charCodeAt(start);
        if (opener === 0x3c || opener === 0x3d || opener === 0x3e) {
          privatePrefixIndex = start;
          privateParameterIndex = params.length;
        }
      }
      params.push(i > start ? paramSection.substring(start, i) : "0");
      start = i + 1;
    }
  }

  let command = intermediates + finalRaw;
  const first = params[0];

  if (first !== undefined && first.charCodeAt(0) === 0x3f) {
    type = CODE_TYPES.DEC;
    privatePrefixIndex = 0;
    if (first.length > 1) params[0] = first.substring(1);
    else {
      if (params.length > 1) needsGroups = true;
      params.shift();
    }
  } else if (privateParameterIndex !== -1) {
    const param = params[privateParameterIndex];
    type = CODE_TYPES.PRIVATE;
    command = param[0] + command;
    if (param.length > 1) params[privateParameterIndex] = param.substring(1);
    else {
      if (params.length > 1) needsGroups = true;
      params.splice(privateParameterIndex, 1);
    }
  }

  if (
    type === CODE_TYPES.CSI &&
    command === "m" &&
    params.length === 5 &&
    params[1] === "2" &&
    (first === "38" || first === "48")
  ) {
    if (!needsGroups) parameterGroups = [[params[0]], [params[1]], [params[2]], [params[3]], [params[4]]];
    params.splice(2, 0, "0");
  }

  if (type === CODE_TYPES.CSI && command === "r" && params.length === 2 && params[1] === "0") {
    params[1] = "-1";
    needsGroups = true;
  }

  if (needsGroups) {
    const source =
      privatePrefixIndex === -1
        ? paramSection
        : paramSection.slice(0, privatePrefixIndex) + paramSection.slice(privatePrefixIndex + 1);
    parameterGroups = source.split(";").map(param => param.split(":"));
  }

  if (parameterGroups) return { type, pos: introducer.pos, raw, command, params, parameterGroups };
  return { type, pos: introducer.pos, raw, command, params };
}
