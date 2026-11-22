"use client";

import { useEffect, useState } from "react";

type Sugestao = { id: string; nome: string; justificativa: string; criadaEm: string };
export function AdminParticipacaoNome() {
  const [aberta, setAberta] = useState(false);
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [aviso, setAviso] = useState("");

  async function carregar() {
    try {
      const r = await fetch("/api/admin/participacao-nome", { cache: "no-store" });
      const data = await r.json() as { aberta?: boolean; sugestoes?: Sugestao[]; erro?: string };
      if (!r.ok) throw new Error(data.erro || "Falha ao consultar.");
      setAberta(data.aberta === true);
      setSugestoes(data.sugestoes || []);
      setAviso("");
    } catch (e) { setAviso(e instanceof Error ? e.message : "Falha ao consultar."); }
    finally { setCarregando(false); }
  }
  useEffect(() => { void carregar(); }, []);

  async function alternar() {
    const abrir = !aberta;
    const confirmacao = abrir ? "ABRIR CONSULTA" : "ENCERRAR CONSULTA";
    const digitado = window.prompt(abrir
      ? "A consulta ficará visível no menu do site e aceitará sugestões. Para confirmar, digite ABRIR CONSULTA:"
      : "A consulta deixará de receber sugestões. Para confirmar, digite ENCERRAR CONSULTA:");
    if (digitado !== confirmacao) { setAviso("Alteração cancelada."); return; }
    setOcupado(true);
    try {
      const r = await fetch("/api/admin/participacao-nome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aberta: abrir, confirmacao }),
      });
      const data = await r.json() as { ok?: boolean; aberta?: boolean; erro?: string };
      if (!r.ok || !data.ok) throw new Error(data.erro || "Alteração não concluída.");
      await carregar();
      setAviso(abrir ? "Consulta aberta. O menu público agora pode mostrar o convite." : "Consulta encerrada. As sugestões estão preservadas.");
    } catch (e) { setAviso(e instanceof Error ? e.message : "Alteração não concluída."); }
    finally { setOcupado(false); }
  }

  return <section className="mt-7 rounded-xl border border-black/10 bg-white p-6">
    <h2 className="text-xl font-bold">Sugestões para o nome do projeto</h2>
    <p className="mt-3 text-sm leading-6 text-black/65">O lançamento continua como Fora da Pauta. Quando houver público acompanhando, podemos abrir um convite para sugerir outros nomes. As sugestões não alteram a marca automaticamente.</p>
    <p className="mt-4 font-semibold">Situação: {carregando ? "Consultando…" : aberta ? "Aberta ao público" : "Fechada — convite oculto"}</p>
    <button type="button" disabled={ocupado || carregando} onClick={() => void alternar()}
      className={"mt-4 min-h-12 rounded-lg px-5 py-3 font-bold disabled:opacity-50 " + (aberta ? "bg-red-700 text-white" : "bg-[#183352] text-white")}>
      {aberta ? "Encerrar consulta" : "Abrir consulta ao público"}
    </button>
    {aviso && <p role="status" className="mt-3 text-sm">{aviso}</p>}
    <h3 className="mt-8 text-lg font-bold">Sugestões recebidas ({sugestoes.length}{sugestoes.length === 200 ? "+" : ""})</h3>
    {sugestoes.length === 0
      ? <p className="mt-2 text-sm text-black/60">Nenhuma sugestão registrada.</p>
      : <div className="mt-3 space-y-3">{sugestoes.map(s =>
          <article key={s.id} className="rounded-lg border border-black/10 bg-[#f7f8fa] p-4">
            <p className="font-bold">{s.nome}</p>
            {s.justificativa && <p className="mt-2 whitespace-pre-wrap text-sm">{s.justificativa}</p>}
            <p className="mt-2 text-xs text-black/55">{new Date(s.criadaEm).toLocaleDateString("pt-BR")}</p>
          </article>
        )}</div>}
    {sugestoes.length === 200 && <p className="mt-2 text-xs text-black/60">Exibidas as 200 sugestões mais recentes.</p>}
  </section>;
}
