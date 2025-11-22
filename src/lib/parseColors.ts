export function parseColorTags(text: string) {
  const regex = /<(\w+|#[0-9A-Fa-f]{6})>/g;
  const parts: { color: string; text: string }[] = [];

  let lastIndex = 0;
  let lastColor = "white";

  let match;
  while ((match = regex.exec(text)) !== null) {
    // tekst przed tagiem
    if (match.index > lastIndex) {
      parts.push({ color: lastColor, text: text.slice(lastIndex, match.index) });
    }

    lastColor = match[1]; // ustaw nowy kolor
    lastIndex = match.index + match[0].length; // przesuwamy indeks po tagu
  }

  // reszta tekstu po ostatnim tagu
  if (lastIndex < text.length) {
    parts.push({ color: lastColor, text: text.slice(lastIndex) });
  }

  return parts;
}
