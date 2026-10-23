"use client";

import { useEffect, useState } from "react";

const alternativas = [
  { valor: "pergunta", rotulo: "Fazer uma pergunta" },
  { valor: "discordancia", rotulo: "Manifestar discordância" },
  { valor: "elogio", rotulo: "Elogiar uma decisão" },
  { valor: "sugestao", rotulo: "Apresentar uma sugestão" },
  { valor: "cobranca", rotulo: "Cobrar uma providência" },
] as const;

export function InteracaoPessoaPublica({ candidaturaId }: { candidaturaId: string }) {
  const [conectado, setConectado] = useState<boolean | null>(null);
  const [erroConexao, setErroConexao] = useState(false);
  const [categoria, setCategoria] = useState<string>("pergunta");
  const [mensagem, setMensagem] = useState("");
  const [consentiu, setConsentiu] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [protocolo, setProtocolo] = useState("");
  const [exibirHistorico, setExibirHistorico] = useState(false);
  const [historico, setHistorico] = useState<{ id: string; mensagem: string; status: string; resposta_texto: string | null; resposta_autoria: string | null }[]>([]);
  const [situacao, setSituacao] = useState("");

  useEffect(() => {
    let montado = true;
    async function verificar() {
      try {
        const resposta = await fetch("/api/telegram/sessao", { cache: "no-store" });
        if (!resposta.ok) throw Error("Não foi possível conferir inscrição");
        const dados = await resposta.json() as { ativo?: boolean };
        if (montado) {
          setConectado(dados.ativo === true);
          setErroConexao(false);
        }
      } catch {
        if (montado) { setConectado(null); setErroConexao(true); }
      }
    }
    void verificar();
    window.addEventListener("focus", verificar);
    return () => { montado = false; window.removeEventListener("focus", verificar); };
  }, []);

  async function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setErro("");
    try {
      const resposta = await fetch("/api/interacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidaturaId,
          categoria,
          mensagem,
          consentiu,
          origemCaminho: (() => {
            const origem = new URLSearchParams(window.location.search).get("origem");
            return origem && /^\/campanhas\/[A-Za-z0-9_-]{1,100}\/candidatos$/.test(origem)
              ? origem
              : window.location.pathname;
          })(),
        }),
      });
      const dados = await resposta.json() as {
        recebido?: boolean; protocolo?: string; situacao?: string; erro?: string;
      };
      if (!resposta.ok || !dados.recebido || !dados.protocolo) {
        throw new Error(dados.erro || "Não foi possível registrar sua mensagem.");
      }
      setProtocolo(dados.protocolo);
      setSituacao(dados.situacao || "Mensagem recebida.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível registrar sua mensagem.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section id="fale-com-esta-pessoa" className="border-t border-black/15 py-8 sm:py-10">
      <div className="border border-black/15 bg-white/50 p-5 sm:p-7">
        <h2 className="text-2xl font-bold tracking-tight">Fale com esta pessoa</h2>
        <p className="mt-3 text-sm leading-7 text-black/65 sm:text-base">
          Faça uma pergunta, apresente uma sugestão ou se manifeste sobre sua atuação política.
          O Fora da Pauta poderá encaminhar a mensagem após verificar um canal público de contato.
          Se houver resposta, ela poderá chegar a você pelo nosso Telegram.
        </p>
        {conectado === false ? (
          <p className="mt-5 border-l-4 border-[#FFC400] bg-white p-4 text-sm leading-6">
            Para enviar ou consultar manifestações, conecte primeiro sua inscrição
            pelo Telegram. Não é necessário criar outra conta.{" "}
            <a href="/votou-fique-de-olho" className="font-semibold underline">
              Conectar pelo Fique de Olho
            </a>
          </p>
        ) : null}
        {conectado === null ? (
          <p className="mt-5 text-sm text-black/60" role="status">
            {erroConexao ? "Não foi possível conferir sua conexão com o Telegram. Reabra esta página." : "Conferindo sua inscrição no Telegram..."}
          </p>
        ) : null}
        {conectado === true ? (
        <button type="button" className="mt-5 text-sm font-semibold underline underline-offset-4"
          onClick={async () => {
            if (exibirHistorico) { setExibirHistorico(false); return; }
            setErro("");
            try {
              const r = await fetch("/api/interacoes/minhas", { cache: "no-store" });
              const dados = await r.json() as {
                registros?: { id: string; mensagem: string; status: string; resposta_texto: string | null; resposta_autoria: string | null }[];
                erro?: string;
              };
              if (!r.ok) throw Error(dados.erro || "Não foi possível consultar.");
              setHistorico(dados.registros || []);
              setExibirHistorico(true);
            } catch (e) { setErro(e instanceof Error ? e.message : "Falha na consulta."); }
          }}>
          {exibirHistorico ? "Ocultar minhas manifestações" : "Consultar minhas manifestações"}
        </button>
        ) : null}
        {exibirHistorico ? (
          <div className="mt-4 space-y-4" role="region" aria-label="Minhas manifestações">
            {historico.map(item => <div key={item.id} className="rounded-xl border border-black/10 bg-white p-4">
              <p className="text-xs text-black/50">Protocolo: {item.id}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{item.mensagem}</p>
              <p className="mt-2 font-semibold">Situação: {item.status.replaceAll("_", " ")}</p>
              {item.resposta_texto ? (
                <p className="mt-2 whitespace-pre-wrap text-sm">
                  Resposta {item.resposta_autoria === "assessoria" ? "da assessoria" : "confirmada"}: {item.resposta_texto}
                </p>
              ) : null}
            </div>)}
            {historico.length === 0 ? <p className="text-sm">Você ainda não enviou manifestações.</p> : null}
          </div>
        ) : null}
        {protocolo ? (
          <div role="status" className="mt-5 rounded-xl border border-black/15 p-4">
            <p className="font-semibold">Mensagem recebida pelo Fora da Pauta</p>
            <p className="mt-2 text-sm">{situacao}</p>
            <p className="mt-2 break-all text-xs text-black/60">Número de acompanhamento: {protocolo}</p>
            <p className="mt-3 text-xs text-black/60">
              O recebimento não significa que a mensagem já foi enviada ao destinatário
              nem garante uma resposta.
            </p>
          </div>
        ) : (
          conectado === true ? <form onSubmit={enviar} className="mt-6 space-y-5">
            <fieldset>
              <legend className="mb-3 font-semibold">O que você gostaria de fazer?</legend>
              <div className="space-y-3">
                {alternativas.map(item => (
                  <label className="flex items-center gap-3 text-sm" key={item.valor}>
                    <input type="radio" name="tipo-interacao" value={item.valor}
                      checked={categoria === item.valor}
                      onChange={() => setCategoria(item.valor)} />
                    <span>{item.rotulo}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className="font-semibold">Sua mensagem</span>
              <textarea required minLength={15} maxLength={2000} rows={5}
                value={mensagem} onChange={e => setMensagem(e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/20 bg-white p-3 text-base"
                placeholder="Escreva com suas palavras o que gostaria de dizer..." />
              <span className="block text-right text-xs text-black/50">{mensagem.length}/2000</span>
            </label>
            <label className="flex items-start gap-3 text-sm leading-6">
              <input type="checkbox" required checked={consentiu}
                onChange={e => setConsentiu(e.target.checked)} className="mt-1" />
              <span>Autorizo o Fora da Pauta a analisar e encaminhar esta mensagem
                à pessoa pública ou à sua equipe por um canal verificado.
                Meu e-mail, telefone e identificação no Telegram não serão enviados.
                Entendo que não há garantia de resposta.</span>
            </label>
            <p className="text-xs leading-5 text-black/55">
              É necessário estar conectado ao Fora da Pauta pelo Telegram.
              Não inclua endereço residencial, documentos ou informações pessoais sensíveis.
            </p>
            {erro ? <p role="alert" className="text-sm text-red-700">{erro}</p> : null}
            <button type="submit" disabled={enviando || !consentiu || mensagem.trim().length < 15}
              className="min-h-12 w-full bg-[#FFC400] px-5 py-3 font-bold text-black disabled:opacity-50">
              {enviando ? "Registrando..." : "Enviar pelo Fora da Pauta"}
            </button>
          </form> : null
        )}
      </div>
    </section>
  );
}
