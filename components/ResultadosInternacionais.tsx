"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Pessoa = { pessoaPoliticaId: string; nomePublico: string; paises: string[]; url: string };
type Resultado = { termo: string; pessoas: Pessoa[]; erro: boolean };
export function ResultadosInternacionais({ termo }: { termo: string }) {
  const [resultado, setResultado] = useState<Resultado>({ termo: "", pessoas: [], erro: false });
  useEffect(() => {
    if (termo.trim().length < 2) return;
    const controller = new AbortController();
    fetch(`/api/pessoas/internacionais?nome=${encodeURIComponent(termo)}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error("Falha na busca"); return r.json(); })
      .then(d => {
        if (!controller.signal.aborted) setResultado({
          termo, pessoas: Array.isArray(d.resultados) ? d.resultados : [], erro: false,
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResultado({ termo, pessoas: [], erro: true });
      });
    return () => controller.abort();
  }, [termo]);
  if (!termo) return null;
  const carregando = resultado.termo !== termo;
  const pessoas = carregando ? [] : resultado.pessoas;
  return <section className="mt-6" aria-label="Personalidades internacionais">
    <h3 className="text-lg font-bold">Personalidades internacionais</h3>
    {carregando ? <p className="mt-2 text-sm">Consultando...</p> : null}
    {!carregando && resultado.erro ? <p role="alert" className="mt-2 text-sm">Não foi possível consultar as fichas internacionais.</p> : null}
    {!carregando && !resultado.erro && pessoas.length === 0 ? <p className="mt-2 text-sm text-black/60">Nenhuma ficha internacional encontrada nesta base.</p> : null}
    <div className="mt-3 space-y-3">{pessoas.map(p => <Link key={p.pessoaPoliticaId} href={p.url}  className="block rounded-xl border border-black/15 p-4">
      <span className="block font-semibold">{p.nomePublico}</span>
      <span className="mt-1 block text-sm text-black/60">País: {p.paises.join(", ")} · Ver ficha política</span>
    </Link>)}</div>
  </section>;
}
