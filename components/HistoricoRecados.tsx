"use client";

import { useEffect, useState } from "react";

type Recado = { id: string; destinatario: "projeto" | "comunidade"; texto: string; status: string; criado_em: string };
const estados: Record<string, string> = { recebido: "Recebido", em_analise: "Em análise", respondido: "Marcado como respondido", arquivado: "Arquivado" };

export function HistoricoRecados() {
  const [recados, setRecados] = useState<Recado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  useEffect(() => {
    let ativo = true;
    fetch("/api/recados", { credentials: "same-origin", cache: "no-store" })
      .then(async resposta => { if (!resposta.ok) throw Error("Não foi possível consultar seus recados."); return resposta.json(); })
      .then((dados: { recados?: Recado[] }) => { if (ativo) setRecados(Array.isArray(dados.recados) ? dados.recados : []); })
      .catch(() => { if (ativo) setErro("Não foi possível carregar o histórico. Tente novamente mais tarde."); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);
  if (carregando) return <p role="status" className="mt-8 text-center text-slate-300">Carregando recados...</p>;
  if (erro) return <p role="alert" className="mt-8 text-center text-red-200">{erro}</p>;
  if (!recados.length) return <div className="mt-8 rounded-xl border border-[#344760] bg-[#24334b] p-6 text-center"><p>Você ainda não tem recados registrados neste navegador.</p><a href="/mandar-recado" className="mt-4 inline-block font-semibold text-yellow-300 underline">Mandar um recado</a></div>;
  return <div className="mt-8 space-y-3">{recados.map(recado => <article key={recado.id} className="rounded-xl border border-[#344760] bg-[#24334b] p-5">
    <div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-bold">{recado.destinatario === "projeto" ? "Para o Fora da Pauta" : "Para a comunidade"}</h2><span className="rounded-md bg-[#334e71] px-2 py-1 text-xs text-yellow-200">{estados[recado.status] ?? recado.status}</span></div>
    <p className="mt-2 text-xs text-slate-300">{new Date(recado.criado_em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</p>
    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">{recado.texto}</p>
    <p className="mt-3 text-xs text-slate-300">Protocolo: <span className="break-all">{recado.id}</span></p>
    {recado.status === "respondido" && <p className="mt-3 text-xs text-yellow-200">Este estado é administrativo e não significa que uma resposta tenha sido enviada.</p>}
  </article>)}</div>;
}
