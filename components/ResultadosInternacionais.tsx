"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Pessoa = { pessoaPoliticaId: string; nomePublico: string; paises: string[]; url: string };
export function ResultadosInternacionais({ termo }: { termo: string }) {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(false);
  useEffect(() => {
    if (termo.trim().length < 2) { setPessoas([]); setErro(false); return; }
    const controller = new AbortController();
    setCarregando(true);
    setErro(false);
    setPessoas([]);
    fetch(`/api/pessoas/internacionais?nome=${encodeURIComponent(termo)}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error("Falha na busca"); return r.json(); })
      .then(d => { if (!controller.signal.aborted) setPessoas(Array.isArray(d.resultados) ? d.resultados : []); })
      .catch(() => { if (!controller.signal.aborted) setErro(true); })
      .finally(() => { if (!controller.signal.aborted) setCarregando(false); });
    return () => controller.abort();
  }, [termo]);
  if (!termo) return null;
  return <section className="mt-6" aria-label="Personalidades internacionais">
    <h3 className="text-lg font-bold">Personalidades internacionais</h3>
    {carregando ? <p className="mt-2 text-sm">Consultando...</p> : null}
    {erro ? <p role="alert" className="mt-2 text-sm">Não foi possível consultar as fichas internacionais.</p> : null}
    {!carregando && !erro && pessoas.length === 0 ? <p className="mt-2 text-sm text-black/60">Nenhuma ficha internacional encontrada nesta base.</p> : null}
    <div className="mt-3 space-y-3">{pessoas.map(p => <Link key={p.pessoaPoliticaId} href={p.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-black/15 p-4">
      <span className="block font-semibold">{p.nomePublico}</span>
      <span className="mt-1 block text-sm text-black/60">País: {p.paises.join(", ")} · Ver ficha política</span>
    </Link>)}</div>
  </section>;
}
