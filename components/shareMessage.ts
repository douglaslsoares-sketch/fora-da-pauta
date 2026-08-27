const ORIGEM_PUBLICA =
  "https://www.foradapauta.org";

export function criarUrlPublicaDeCompartilhamento(
  url: string,
) {
  try {
    const atual = new URL(url);

    return `${ORIGEM_PUBLICA}${atual.pathname}${atual.search}`;
  } catch {
    return url;
  }
}

export function criarMensagemDeCompartilhamento(
  statement: string,
  url: string,
) {
  const urlPublica =
    criarUrlPublicaDeCompartilhamento(
      url,
    );

  return `${statement}

Entenda a proposta e conhe\u00e7a os argumentos:
${urlPublica}`;
}
