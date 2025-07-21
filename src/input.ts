import { html } from "isum/preactive";
import { examples } from "./examples.ts";
import "./css/input.css";
import { appState, rawInput } from "./app-state.ts";

export const load = async (url: string) => {
  const response = await fetch(url).catch(() => null);
  return response?.ok ? await response.text() : `Error loading ${url}`;
};

export function Input() {
  function handleInput(event: InputEvent) {
    const target = event.target as HTMLTextAreaElement;
    rawInput.value = target.value;
  }

  async function handleExampleClick(value: string) {
    if (value.match(/^\/[a-z.\\]+/)) rawInput.value = await load(value);
    else rawInput.value = value;
  }

  return () => html`
    <textarea class="content" id="input" rows="15" .value=${rawInput.value} @input=${handleInput}></textarea>
    <div class="status-bar">
      <div class="status-item">length: ${appState.value.length}</div>
      <div class="status-spacer"></div>
      <div class="examples-dropdown">
        <span class="examples-trigger">Examples</span>
        <div id="example-buttons-container">
          ${examples
            .toReversed()
            .map(example => html`<button @click=${() => handleExampleClick(example.value)}>${example.label}</button>`)}
        </div>
      </div>
    </div>
  `;
}
