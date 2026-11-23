"use client";

import { useEffect, useState } from "react";

type CandidateFollowCardProps = {
  candidaturaId: string;
};

type Situacao = "conferindo" | "acompanhando" | "disponivel" | "erro";

export function CandidateFollowCard({
  candidaturaId,
}: CandidateFollowCardProps) {
  const [situacao, setSituacao] = useState<Situacao>("conferindo");
  const [tentativa, setTentativa] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");


  useEffect(() => {
    const controller = new AbortController();
    async function consultar() {
      try {
        const resposta = await fetch("/api/site/acompanhamentos", { cache: "no-store", signal: controller.signal });
        const dados = await resposta.json() as { ids?: string[]; erro?: string };
        if (!resposta.ok) throw Error(dados.erro || "Falha na consulta");
        if (!controller.signal.aborted) {
          setSituacao(Array.isArray(dados.ids) && dados.ids.includes(candidaturaId) ? "acompanhando" : "disponivel");
        }
      } catch {
        if (!controller.signal.aborted) setSituacao("erro");
      }
    }
    void consultar();
    window.addEventListener("focus", consultar);
    return () => {
      controller.abort();
      window.removeEventListener("focus", consultar);
    };
  }, [candidaturaId, tentativa]);

  async function alternar() {
    if (salvando || situacao === "erro" || situacao === "conferindo") return;
    const remover = situacao === "acompanhando";
    setSalvando(true);
    setMensagem("");
    try {
      const resposta = await fetch("/api/site/acompanhamentos", {
        method: remover ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: candidaturaId }),
      });
      const dados = await resposta.json() as { erro?: string };
      if (!resposta.ok) throw Error(dados.erro || "Não foi possível salvar.");
      setSituacao(remover ? "disponivel" : "acompanhando");
      setMensagem(remover ? "Você deixou de acompanhar este político." : "Político selecionado.");
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <aside className="border-y border-black/10 py-5" aria-label="Acompanhamento deste político">
      {situacao === "erro" ? (
        <p className="text-sm text-black/65">
          Não foi possível consultar seu acompanhamento neste navegador.
          <button type="button" onClick={() => { setSituacao("conferindo"); setTentativa(valor => valor + 1); }}
            className="ml-2 font-semibold underline underline-offset-4">Tentar novamente</button>
        </p>
      ) : situacao === "conferindo" ? (
        <p role="status" className="text-sm text-black/60">Conferindo acompanhamento...</p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm leading-6 text-black/65">
            {situacao === "acompanhando" ? "Você acompanha este político." : "Quer acompanhar este político?"}
          </p>
          <button type="button" disabled={salvando} aria-pressed={situacao === "acompanhando"}
            onClick={() => void alternar()}
            className={`min-h-11 rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-60 ${situacao === "acompanhando" ? "bg-green-600 text-white" : "bg-[#FFC400] text-black"}`}>
            {salvando ? "Salvando..." : situacao === "acompanhando" ? "Selecionado" : "Acompanhar"}
          </button>
        </div>
      )}
      {mensagem ? <p role="status" className="mt-3 text-sm text-black/70">{mensagem}</p> : null}
    </aside>
  );
}
