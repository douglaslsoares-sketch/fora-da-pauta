// URL exclusiva para o convite: força uma nova leitura da prévia pelo WhatsApp.
// O destino e o conteúdo da home permanecem os mesmos.
const HOME_PUBLICA = "https://www.foradapauta.org/?convite=olho-amarelo-20261030";
const TEXTO = [
  "Conheça o Fora da Pauta.",
  "",
  "Um espaço para entender melhor as decisões que afetam a nossa vida e o que está por trás das notícias.",
  "",
  "Acesse: " + HOME_PUBLICA,
].join("\n");

export function HomeShareInvite() {
  return (
    <div>
      <h2 id="convite-titulo">Convide alguém a conhecer</h2>
      <p className="mt-3 max-w-2xl text-white/75">
        Convide alguém a conhecer o que está por trás das notícias.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(TEXTO)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center border border-[#FFC400] bg-[#FFC400] px-5 py-3 font-semibold text-black hover:bg-[#e9b300]"
        >
          Enviar pelo WhatsApp
        </a>
      </div>
    </div>
  );
}
