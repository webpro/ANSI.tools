import { html } from "isum/preactive";
import { examples } from "./examples.ts";
import { appState, rawInput } from "./app-state.ts";
import { createSettingsStore } from "./util/settings.ts";
import { getInputFromURL, updateURL } from "./util/url.ts";
import "./css/input.css";

export const load = async (url: string) => {
  const response = await fetch(url).catch(() => null);
  return response?.ok ? await response.text() : `Error loading ${url}`;
};

export function Input() {
  const settings = createSettingsStore("input", { isClear: false });

  if (!rawInput.value && !settings.isClear.value) {
    const input = getInputFromURL();
    if (input) updateInput(input);
    else rawInput.value = examples[0].value;
  }

  function handleInput(event: InputEvent) {
    const target = event.target as HTMLTextAreaElement;
    updateInput(target.value);
  }

  async function updateInput(value: string) {
    const next = value.match(/^\/[a-z.\\]+/) ? await load(value) : value;
    rawInput.value = next;
    updateURL(next);
  }

  function setExample(value: string) {
    if (!settings.isClear.peek()) updateInput(value);
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
              if (settings.isClear.value) {
                rawInput.value = "";
                updateURL("");
              }
            }}
          />
          clear
        </label>
      </div>
      <div class="examples-dropdown">
        <button class="examples-trigger" type="button">examples</button>
        <div id="example-buttons-container">
          ${examples
            .toReversed()
            .map(example => html`<button @click=${() => setExample(example.value)}>${example.label}</button>`)}
        </div>
      </div>
    </div>
  `;
}
