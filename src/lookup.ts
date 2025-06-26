import "./css/global.css";
import "./css/app.css";
import "./css/lookup.css";
import "./css/table.css";

function attachSearchHandler() {
  const searchInput = document.getElementById("ansi-search") as HTMLInputElement;
  const tableBody = document.getElementById("ansi-codes-tbody");
  if (!tableBody) return;

  const rows: { element: HTMLElement; text: string }[] = [];
  for (const row of tableBody.querySelectorAll("tr")) {
    const text = row.textContent?.toLowerCase() ?? "";
    rows.push({ element: row as HTMLElement, text: text });
  }

  searchInput.addEventListener("input", (e) => {
    const query = (e.target as HTMLInputElement).value.trim().toLowerCase();
    for (const row of rows) row.element.hidden = !row.text.includes(query);
  });
}

attachSearchHandler();
