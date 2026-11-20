// Guard against invented doses: every number in a generated answer must already appear in the source cards.
const toAscii = (s: string) => s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));

// Numbers in `s`, with Bangla digits normalised; list markers at the start of a line ("1) ", "২. ") are ignored.
export const numbers = (s: string): string[] =>
  toAscii(s).split("\n").map((l) => l.replace(/^\s*\d+\s*[).:]\s+/, "")).join("\n").match(/\d+(?:\.\d+)?/g) ?? [];

export function inventsNumbers(answer: string, cardsText: string): boolean {
  const allowed = new Set(numbers(cardsText));
  return numbers(answer).some((n) => !allowed.has(n));
}
