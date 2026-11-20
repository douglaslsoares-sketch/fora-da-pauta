// OpenAI PCM speech output: 24 kHz, 16-bit, mono.
// Assemble samples without introducing MP3 frame boundaries.
export function splitNarration(text: string, max = 3500): string[] {
  const parts: string[] = [];
  let remaining = text.trim();
  while (remaining.length) {
    if (remaining.length <= max) { parts.push(remaining); break; }
    const sample = remaining.slice(0, max);
    const boundaries = [sample.lastIndexOf("\n\n"), sample.lastIndexOf(". "), sample.lastIndexOf("? "), sample.lastIndexOf("! "), sample.lastIndexOf(" ")];
    const boundary = boundaries.find(n => n > max * 0.55) ?? max;
    const length = boundary === max ? max : boundary + (sample.slice(boundary, boundary + 2) === "\n\n" ? 2 : 1);
    parts.push(remaining.slice(0, length).trim());
    remaining = remaining.slice(length).trim();
  }
  return parts;
}
export function combinePcmToWav(chunks: Uint8Array[], silenceMs = 350): Uint8Array {
  const silence = new Uint8Array(Math.floor(24000 * 2 * silenceMs / 1000));
  const total = chunks.reduce((n, chunk) => n + chunk.length, 0) + Math.max(0, chunks.length - 1) * silence.length;
  if (total > 12_000_000 || total % 2 !== 0) throw new Error("Áudio PCM excedeu limite ou está inválido");
  const wav = new Uint8Array(total + 44);
  const view = new DataView(wav.buffer);
  const ascii = (offset: number, value: string) => { for (let i = 0; i < value.length; i++) wav[offset + i] = value.charCodeAt(i); };
  ascii(0, "RIFF"); view.setUint32(4, total + 36, true); ascii(8, "WAVE");
  ascii(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); view.setUint32(24, 24000, true);
  view.setUint32(28, 48000, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  ascii(36, "data"); view.setUint32(40, total, true);
  let offset = 44;
  for (const [i, chunk] of chunks.entries()) {
    if (chunk.length % 2) throw new Error("Amostras PCM inválidas");
    if (i) { wav.set(silence, offset); offset += silence.length; }
    wav.set(chunk, offset); offset += chunk.length;
  }
  return wav;
}
