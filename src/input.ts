import { html } from "isum/preactive";
import { examples } from "./examples.ts";
import "./css/input.css";
import { appState, rawInput } from "./app-state.ts";
import { createSettingsStore } from "./util/settings.ts";

export const load = async (url: string) => {
  const response = await fetch(url).catch(() => null);
  return response?.ok ? await response.text() : `Error loading ${url}`;
};

export function Input() {
  const settings = createSettingsStore("input", { isClear: false });
  if (!rawInput.value && !settings.isClear.value) rawInput.value = examples[0].value;

  function handleInput(event: InputEvent) {
    const target = event.target as HTMLTextAreaElement;
    rawInput.value = target.value;
  }

  async function handleExampleClick(value: string) {
    if (settings.isClear.peek()) return;
    if (value.match(/^\/[a-z.\\]+/)) rawInput.value = await load(value);
    else rawInput.value = value;
  }

  return () => html`
    <textarea
      class="content"
      id="input"
      rows="15"
      .value=${settings.isClear.value ? "" : rawInput.value}
      @input=${handleInput}
    ></textarea>
    <div class="status-bar">
      <div class="status-item">length: ${appState.value.length}</div>
      <div class="status-spacer"></div>
      <div class="status-item">
        <label>
          <input
            type="checkbox"
            data-key="clear"
            ?checked=${settings.isClear.value}
            @change=${() => {
              settings.isClear.value = !settings.isClear.peek();
              if (settings.isClear.value) rawInput.value = "";
            }}
          />
          clear
        </label>
      </div>
      <div class="examples-dropdown">
        <span class="examples-trigger">examples</span>
        <div id="example-buttons-container">
          ${examples
            .toReversed()
            .map(example => html`<button @click=${() => handleExampleClick(example.value)}>${example.label}</button>`)}
        </div>
      </div>
    </div>
  `;
}
