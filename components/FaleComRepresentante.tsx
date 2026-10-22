"use client";

import { useState } from "react";

type ContatoInstitucional = {
  valor: string;
  fonte: string;
};

type Contatos = {
  whatsapp?: ContatoInstitucional;
  email?: ContatoInstitucional;
  site?: ContatoInstitucional;
};

type Props = {
  representanteNome?: string;
  assunto?: string;
  contatos?: Contatos;
};

const manifestacoes = [
  { valor: "pergunta", rotulo: "Fazer uma pergunta" },
  { valor: "discordancia", rotulo: "Manifestar discordância" },
  { valor: "elogio", rotulo: "Elogiar uma decisão" },
  { valor: "sugestao", rotulo: "Apresentar uma sugestão" },
] as const;

function linkSeguro(valor: string) {
  try {
    const url = new URL(valor);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function FaleComRepresentante({
  representanteNome,
  assunto,
  contatos,
}: Props) {
  const [tipo, setTipo] = useState<(typeof manifestacoes)[number]["valor"]>("pergunta");
  const [mensagem, setMensagem] = useState("");
  const [aviso, setAviso] = useState("");

  const texto = mensagem.trim();
  const fone = contatos?.whatsapp?.valor.replace(/\D/g, "") ?? "";
  const whatsapp = contatos?.whatsapp && /^\d{10,15}$/.test(fone)
    && linkSeguro(contatos.whatsapp.fonte)
    ? `https://wa.me/${fone}?text=${encodeURIComponent(texto)}`
    : null;

  const emailValor = contatos?.email?.valor.trim() ?? "";
  const email = contatos?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValor)
    && linkSeguro(contatos.email.fonte)
    ? `mailto:${emailValor}?subject=${encodeURIComponent(assunto ?? "Mensagem ao gabinete")}&body=${encodeURIComponent(texto)}`
    : null;

  const site = contatos?.site && linkSeguro(contatos.site.valor) && linkSeguro(contatos.site.fonte)
    ? linkSeguro(contatos.site.valor)
    : null;

  async function copiar() {
    if (!texto) return;
    try {
      await navigator.clipboard.writeText(texto);
      setAviso("Mensagem copiada. Agora você pode colá-la no canal desejado.");
    } catch {
      setAviso("Não foi possível copiar automaticamente. Selecione o texto e copie.");
    }
  }

  const campo = "min-h-11 rounded-xl border border-black/15 px-4 py-3 text-sm font-semibold";
  const disponivel = "border-black/20 bg-white text-black hover:border-[#FFC400] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC400]";
  const indisponivel = "cursor-not-allowed border-black/10 bg-black/[0.04] text-black/35";

  return (
    <section aria-labelledby="fale-representante-titulo" className="rounded-2xl border border-black/10 bg-white p-5 text-[#151515] shadow-sm sm:p-7">
      <h2 id="fale-representante-titulo" className="flex items-center gap-3 text-xl font-bold tracking-tight">
        <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full border-2 border-[#FFC400] text-sm">✉</span>
        Fale com seu representante
      </h2>
      <p className="mt-3 text-sm leading-6 text-black/70">
        Você concorda com essa decisão? Tem alguma dúvida ou gostaria de fazer uma sugestão?
        Sua opinião pode chegar a quem foi eleito.
      </p>
      {representanteNome ? (
        <p className="mt-2 text-sm font-semibold">Representante: {representanteNome}</p>
      ) : null}

      <fieldset className="mt-6">
        <legend className="text-sm font-bold">O que você gostaria de fazer?</legend>
        <div className="mt-3 space-y-3">
          {manifestacoes.map((item) => (
            <label key={item.valor} className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="radio"
                name="tipo-manifestacao"
                value={item.valor}
                checked={tipo === item.valor}
                onChange={() => setTipo(item.valor)}
                className="size-4 accent-black"
              />
              {item.rotulo}
            </label>
          ))}
        </div>
      </fieldset>

      <label htmlFor="mensagem-representante" className="mt-7 block text-sm font-bold">
        Sua mensagem
      </label>
      <textarea
        id="mensagem-representante"
        value={mensagem}
        onChange={(e) => { setMensagem(e.target.value); setAviso(""); }}
        rows={4}
        maxLength={4000}
        placeholder="Escreva com suas palavras o que gostaria de dizer..."
        className="mt-2 block w-full resize-y rounded-xl border border-black/15 bg-white p-4 text-base leading-6 outline-none placeholder:text-black/40 focus:border-black"
      />
      <p className="mt-2 text-xs leading-5 text-black/50">
        A mensagem é sua. Você pode revisá-la; o Fora da Pauta não a envia automaticamente nem a armazena.
      </p>
      <button
        type="button"
        onClick={() => void copiar()}
        disabled={!texto}
        className="mt-4 min-h-12 w-full rounded-xl bg-[#FFC400] px-4 font-semibold text-black hover:bg-[#e9b300] disabled:cursor-not-allowed disabled:bg-black/[0.07] disabled:text-black/35"
      >
        Copiar minha mensagem
      </button>
      {aviso ? <p role="status" className="mt-3 text-sm font-medium">{aviso}</p> : null}

      <div className="mt-7 border-t border-black/10 pt-5">
        <p className="text-sm leading-6 text-black/65">
          Depois, escolha um canal oficial do representante para enviar sua mensagem.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {whatsapp && texto ? (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`${campo} ${disponivel}`}>
              WhatsApp ↗
            </a>
          ) : (
            <span aria-disabled="true" className={`${campo} ${indisponivel}`}>WhatsApp indisponível</span>
          )}
          {email && texto ? (
            <a href={email} className={`${campo} ${disponivel}`}>E-mail ↗</a>
          ) : (
            <span aria-disabled="true" className={`${campo} ${indisponivel}`}>E-mail indisponível</span>
          )}
          {site ? (
            <a href={site} target="_blank" rel="noopener noreferrer" className={`${campo} ${disponivel}`}>Site oficial ↗</a>
          ) : null}
        </div>
        {!(whatsapp || email || site) ? (
          <p className="mt-4 text-xs leading-5 text-black/55">
            Os canais só serão habilitados depois de confirmados em fontes institucionais.
            Você já pode escrever e copiar sua mensagem.
          </p>
        ) : (
          <p className="mt-4 text-xs leading-5 text-black/55">
            Os contatos são públicos e devem ser verificados na fonte institucional antes da publicação.
          </p>
        )}
      </div>
    </section>
  );
}
