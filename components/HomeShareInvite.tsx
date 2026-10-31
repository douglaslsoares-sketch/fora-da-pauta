"use client";

const HOME_PUBLICA = "https://www.foradapauta.org/";
const TEXTO = [
  "Conheça o Fora da Pauta.",
  "",
  "Um espaço para entender melhor as decisões que afetam a nossa vida e o que está por trás das notícias.",
  "",
  "Acesse: " + HOME_PUBLICA,
].join("\n");

const LINK_WHATSAPP = `https://wa.me/?text=${encodeURIComponent(TEXTO)}`;

/**
 * O WhatsApp recebe texto + link pelo wa.me. A miniatura acima da mensagem,
 * quando exibida no aplicativo, vem das metatags Open Graph da página inicial.
 */
export function HomeShareInvite() {
  return (
    <section aria-labelledby="convite-titulo" className="mt-8 border-t border-black/10 pt-6">
      <h2 id="convite-titulo" className="text-xl font-bold text-black">
        Convide alguém a conhecer
      </h2>
      <p className="mt-2 text-sm leading-6 text-black/65">
        Compartilhe o Fora da Pauta pelo WhatsApp.
      </p>
      <div className="mt-4 overflow-hidden rounded-2xl border border-black/15 bg-white">
        <img
          src="/compartilhar/olho-v2"
          alt="Olho amarelo do Fora da Pauta sobre fundo preto, sem texto."
          width={1200}
          height={630}
          loading="lazy"
          className="block h-auto w-full"
        />
        <div className="p-4">
          <p className="font-bold text-black">Fora da Pauta</p>
          <p className="mt-1 text-sm text-black/65">
            Como o jogo é jogado. Decisões políticas que afetam a sua vida.
          </p>
          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-black/80">
            {TEXTO}
          </p>
        </div>
      </div>
      <a
        href={LINK_WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#FFD700] px-5 py-3 text-center font-bold text-black hover:bg-[#ebc700]"
      >
        Enviar pelo WhatsApp
      </a>
    </section>
  );
}
