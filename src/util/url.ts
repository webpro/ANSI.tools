const SEARCH_PARAM_NAME = "s";

export function getInputFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  const input = params.get(SEARCH_PARAM_NAME);
  if (!input) return null;
  try {
    return decodeURIComponent(input);
  } catch (error) {
    console.warn("Failed to decode input parameter:", error);
    return input;
  }
}

export function updateURL(input: string): void {
  const url = new URL(window.location.href);
  if (!input.trim()) url.searchParams.delete(SEARCH_PARAM_NAME);
  else url.searchParams.set(SEARCH_PARAM_NAME, encodeURIComponent(input));
  window.history.replaceState({}, "", url.toString());
}
