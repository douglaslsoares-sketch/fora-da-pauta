/** Junta uma nova fala ao texto que o cidadão já escreveu ou revisou.
 * Nenhum áudio é armazenado ou enviado pelo Fora da Pauta.
 */
export function juntarTranscricao(textoAnterior: string, falaReconhecida: string): string {
  const fala = falaReconhecida.trim().replace(/\s+/g, " ");
  if (!fala) return textoAnterior;
  const anterior = textoAnterior.trimEnd();
  return anterior ? anterior + " " + fala : fala;
}
