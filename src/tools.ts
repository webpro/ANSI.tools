import { html, signal, computed } from "isum/preactive";
import { createSettingsStore } from "./util/settings.ts";
import { getPosition, getPositionReversed } from "./util/parse-input.ts";
import { appState } from "./app-state.ts";
import { split, unescapeNewlines } from "./util/string.ts";
import "./css/tools.css";

export function Tools() {
  const settings = createSettingsStore("tools", { isRenderNewlines: false, isGreedy: true });

  const limitPlain = signal<number | null>(null);
  const limitInput = signal<number | null>(null);

  function handleTruncateInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const value = input.valueAsNumber;
    limitPlain.value = Number.isNaN(value) ? null : value;
    limitInput.value = null;
  }

  function handleAnsiIndexInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const value = input.valueAsNumber;
    limitInput.value = Number.isNaN(value) ? null : value;
    limitPlain.value = null;
  }

  const inputValues = computed(() => {
    const ansi = limitInput.value;
    if (ansi !== null) return { plain: getPositionReversed(appState.value, ansi), ansi };
    const isGreedy = settings.isGreedy.value;
    const plain = limitPlain.value ?? 0;
    return { plain, ansi: getPosition(appState.value, plain, isGreedy) };
  });

  const plain = computed(() => split(appState.value.plain, inputValues.value.plain));

  const ansi = computed(() => {
    const ansi = split(appState.value.input, inputValues.value.ansi);
    if (settings.isRenderNewlines.value) return [unescapeNewlines(ansi[0]), unescapeNewlines(ansi[1])];
    return ansi;
  });

  return () => html`
    <div class="status-bar">
      <div class="status-item">plain text</div>
    </div>

    <pre class="utility-output">${appState.value.plain}</pre>

    <div class="status-bar">
      <div class="status-item">map position</div>
      <div class="status-spacer"></div>
      <label class="status-item">
        <input
          type="checkbox"
          class="toggle-newlines"
          ?checked=${settings.isRenderNewlines.value}
          @change=${() => {
            settings.isRenderNewlines.value = !settings.isRenderNewlines.peek();
          }}
        />
        newlines
      </label>
      <label class="status-item">
        <input
          type="checkbox"
          class="toggle-greedy"
          ?checked=${settings.isGreedy.value}
          @change=${() => {
            settings.isGreedy.value = !settings.isGreedy.peek();
          }}
        />
        greedy
      </label>
    </div>

    <div class="tools-grid">
      <input
        type="number"
        min="0"
        max=${appState.value.width}
        placeholder="0"
        .value=${inputValues.value.plain}
        @input=${handleTruncateInput}
      />
      <pre class="plain"><span class="mark">${plain.value[0]}</span><span class="unmark">${plain.value[1]}</span></pre>
      <input
        type="number"
        min="0"
        max=${appState.value.length}
        step="1"
        placeholder="0"
        .value=${inputValues.value.ansi}
        @input=${handleAnsiIndexInput}
      />
      <pre class="ansi"><span class="mark">${ansi.value[0]}</span><span class="unmark">${ansi.value[1]}</span></pre>
    </div>
  `;
}
