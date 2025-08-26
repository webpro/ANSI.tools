import { html, computed, raw } from "isum/preactive";
import { ansiToPre } from "ansi-to-pre";
import { createSettingsStore } from "./util/settings.ts";
import { appState } from "./app-state.ts";
import "./css/output.css";
import { getSegments, unescapeInput } from "./util/string.ts";

export function Output() {
  const settings = createSettingsStore("output", { isLightMode: false, isGridVisible: false });

  const dimensions = computed(() => {
    const lines: string[] = appState.value.plain.split("\n");
    let columns = 0;
    for (const line of lines) columns = Math.max(columns, getSegments(line).length);
    return { lines: lines.length, columns };
  });

  const outputHtml = computed(() => {
    const codes = appState.value.codes;
    const printable = codes.filter(
      code => code.type === "TEXT" || (code.type === "CSI" && code.command === "m") || code.type === "OSC"
    );
    const text = printable
      .map(code => code.plain ?? code.raw)
      .join("")
      .replace(/\\(u009b|x9b)/gi, "\u001b[");
    const normalized = appState.value.isRaw ? text : unescapeInput(text);
    return ansiToPre(normalized);
  });

  return () => html`
    <div
      class=${`content ${settings.isLightMode.value ? "light-bg" : ""} ${settings.isGridVisible.value ? "grid-visible" : ""}`}
    >
      ${raw(outputHtml.value)}
    </div>
    <div class="status-bar">
      <div class="status-item">length: ${appState.value.width}</div>
      <div class="status-item">rows: ${dimensions.value.lines}</div>
      <div class="status-item">columns: ${dimensions.value.columns}</div>
      <div class="status-spacer"></div>
      <div class="status-item">
        <label>
          <input
            type="checkbox"
            data-key="light-mode"
            ?checked=${settings.isLightMode.value}
            @change=${() => {
              settings.isLightMode.value = !settings.isLightMode.peek();
            }}
          />
          invert
        </label>
      </div>
      <div class="status-item">
        <label>
          <input
            type="checkbox"
            data-key="grid-visible"
            ?checked=${settings.isGridVisible.value}
            @change=${() => {
              settings.isGridVisible.value = !settings.isGridVisible.peek();
            }}
          />
          grid
        </label>
      </div>
    </div>
  `;
}
