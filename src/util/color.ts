const ANSI_16_COLORS = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"];

export function getColorName(index: number): string {
  if (index < 8) return ANSI_16_COLORS[index];
  if (index < 16) return `bright ${ANSI_16_COLORS[index % 8]}`;
  if (index < 232) {
    const n = index - 16;
    return `rgb cube ${Math.floor(n / 36)}${Math.floor((n % 36) / 6)}${n % 6}`;
  }
  if (index < 256) return `gray${index - 232}`;
  return `#${index}`;
}
