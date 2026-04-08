export function chunkText(text, size = 800, overlap = 100) {
  const chunks = [];
  let i = 0;

  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += size - overlap;
  }

  return chunks;
}