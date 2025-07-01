import { html } from "isum/preactive";
import { examples } from "./examples.ts";
import "./css/input.css";
import { appState, rawInput } from "./app-state.ts";

export function Input() {
  function handleInput(event: InputEvent) {
    const target = event.target as HTMLTextAreaElement;
    rawInput.value = target.value;
  }

  function handleExampleClick(value: string) {
    rawInput.value = value;
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
