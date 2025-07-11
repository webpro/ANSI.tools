import { html, computed, raw } from "isum/preactive";
import { AnsiUp } from "ansi_up";
import { normalizeBeforeRender } from "./util/ansi.ts";
import { createSettingsStore } from "./util/settings.ts";
import { appState } from "./app-state.ts";
import "./css/output.css";
import { getVisualWidth } from "./util/parse-input.ts";

export function Output() {
  const settings = createSettingsStore("output", { isLightMode: false, isGridVisible: false });

  const dimensions = computed(() => {
    const lines: string[] = appState.value.plain.split("\n");
    let columns = 0;
    for (const line of lines) columns = Math.max(columns, getVisualWidth(line));
    return { lines: lines.length, columns };
  });

  const outputHtml = computed(() => {
    const { input } = appState.value;
    const normalized = normalizeBeforeRender(input);
    const text = normalized.endsWith("\n") ? `${normalized}\u200b` : normalized;
    const convert = new AnsiUp();
    return convert.ansi_to_html(text);
  });

  const whitespaceStart = computed(() => outputHtml.value.match(/^\s+/)?.[0] ?? "");

  return () => html`
    <div
      class=${`content ${settings.isLightMode.value ? "light-bg" : ""} ${settings.isGridVisible.value ? "grid-visible" : ""}`}
    >
      <pre id="visual-output">${whitespaceStart.value}${raw(outputHtml.value)}</pre>
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
