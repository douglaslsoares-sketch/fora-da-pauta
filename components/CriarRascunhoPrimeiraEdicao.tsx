"use client";

import { useState } from "react";
import Link from "next/link";
import { primeiraEdicao } from "@/data/editorial/primeira-edicao";

type ArticleSummary = { id: string; titulo: string; conteudo: string; status: string };

export function CriarRascunhoPrimeiraEdicao() {
  const [ocupado, setOcupado] = useState(false);
  const [artigoId, setArtigoId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");

  async function preparar() {
    if (ocupado) return;
    setOcupado(true);
    setMensagem("");
    try {
      const consulta = await fetch("/api/admin/artigos", { credentials: "same-origin", cache: "no-store" });
      const dados = await consulta.json() as { artigos?: ArticleSummary[]; erro?: string };
      if (!consulta.ok) throw new Error(dados.erro || "Não foi possível conferir os artigos cadastrados.");
      const existente = (dados.artigos || []).find(a => a.titulo === primeiraEdicao.titulo);
      if (existente) {
        setArtigoId(existente.id);
        setMensagem(existente.conteudo === primeiraEdicao.conteudo
          ? "A edição já existe no painel. Nenhuma cópia foi criada."
          : "Já existe um artigo com este título. Confira a versão cadastrada antes de substituí-la.");
        return;
      }
      const resposta = await fetch("/api/admin/artigos", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: primeiraEdicao.titulo,
          resumo: primeiraEdicao.resumo,
          conteudo: primeiraEdicao.conteudo,
          fontes: primeiraEdicao.fontes,
        }),
      });
      const resultado = await resposta.json() as { id?: string; ok?: boolean; erro?: string };
      if (!resposta.ok || !resultado.ok || !resultado.id) {
        throw new Error(resultado.erro || "Não foi possível salvar o rascunho.");
      }
      setArtigoId(resultado.id);
      setMensagem("Rascunho criado no painel. Não foi publicado nem enviado ao público.");
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : "Não foi possível preparar o rascunho.");
    } finally {
      setOcupado(false);
    }
  }

  return <section className="mt-8 rounded-xl border border-[#3a5272] bg-[#192940] p-5">
    <h2 className="text-lg font-bold text-[#f4c542]">Preparação editorial</h2>
    <p className="mt-2 text-sm leading-6 text-slate-300">Esta é uma prévia privada. Ao criar o rascunho, o texto e as fontes ficam no painel administrativo para gerar e aprovar a narração Marim antes da publicação.</p>
    <button type="button" onClick={() => void preparar()} disabled={ocupado || artigoId !== null}
      className="mt-4 min-h-12 rounded-lg bg-[#f4c542] px-5 py-3 font-bold text-[#182337] disabled:opacity-60">
      {ocupado ? "Preparando…" : artigoId ? "Rascunho localizado" : "Criar rascunho no painel"}
    </button>
    {mensagem && <p role="status" className="mt-3 text-sm text-white">{mensagem}</p>}
    {artigoId && <div className="mt-4"><Link href={`/admin/artigos/previa/${artigoId}`} className="inline-flex min-h-11 items-center rounded-lg border border-[#8a9bb4] px-4 py-2 font-semibold text-white">Abrir a prévia do rascunho no painel</Link></div>}
  </section>;
}
