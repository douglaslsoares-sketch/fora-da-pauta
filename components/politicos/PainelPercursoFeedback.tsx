"use client";

import { useState } from "react";

type Passo = {
  t: number; tipo: "pagina" | "acao" | "rolagem";
  pagina: string; detalhe?: string; porcentagem?: number;
};

function nomePagina(path: string) {
  if (path === "/politicos") return "Menu principal";
  if (path === "/politicos/escolher") return "Escolher um político";
  if (path === "/politicos/acompanhados") return "Políticos acompanhados";
  if (path.startsWith("/politicos/historico/")) return "Histórico consultado";
  if (path === "/politicos/historico") return "Pesquisar histórico";
  if (path === "/politicos/avaliar") return "Avaliação";
  if (path === "/politicos/avisos") return "Receber avisos";
  if (path === "/politicos/loja") return "Loja";
  if (path === "/politicos/compartilhar") return "Compartilhar";
  if (path === "/politicos/qr-code") return "QR Code";
  return "Outra página";
}

function resumo(p: Passo) {
  if (p.tipo === "pagina") return "Visitou: " + nomePagina(p.pagina);
  if (p.tipo === "rolagem") return "Rolou até " + p.porcentagem + "% em " + nomePagina(p.pagina);
  return (p.detalhe || "Interação") + " · " + nomePagina(p.pagina);
}

function tempo(ms: number) {
  const s = Math.floor(ms / 1000);
  return Math.floor(s / 60).toString().padStart(2, "0") + ":" + (s % 60).toString().padStart(2, "0");
}

function limpar(valor: unknown): Passo[] {
  if (!Array.isArray(valor)) return [];
  return valor.filter((p): p is Passo =>
    p && typeof p === "object" && Number.isFinite(p.t) && typeof p.pagina === "string" &&
    ["pagina", "acao", "rolagem"].includes(p.tipo) && p.t >= 0
  ).slice(0, 220);
}

export function PainelPercursoFeedback({
  midiaUrl, tipo, percurso,
}: { midiaUrl: string; tipo: "audio" | "video"; percurso: unknown }) {
  const [atual, setAtual] = useState(0);
  const passos = limpar(percurso);
  const indice = passos.findLastIndex(p => p.t <= atual * 1000);
  const destaque = indice >= 0 ? passos[indice] : null;

  return <div className="mt-4 space-y-3">
    {tipo === "video" ? (
      <video
        controls playsInline preload="none"
        src={midiaUrl} className="max-h-[350px] w-full rounded-xl bg-black"
        onTimeUpdate={e => setAtual(e.currentTarget.currentTime)}
        onSeeked={e => setAtual(e.currentTarget.currentTime)}
        aria-label="Feedback de vídeo e voz"
      />
    ) : (
      <audio
        controls preload="none" src={midiaUrl} className="w-full"
        onTimeUpdate={e => setAtual(e.currentTarget.currentTime)}
        onSeeked={e => setAtual(e.currentTarget.currentTime)}
        aria-label="Feedback de voz"
      />
    )}
    {passos.length ? (
      <div className="space-y-2 rounded-xl border border-[#45627b] bg-[#0a2336] p-3">
        <p className="text-sm font-bold text-[#ffd333]">Percurso sincronizado · {passos.length} eventos</p>
        <p aria-live="off" className="rounded-lg bg-[#183c53] p-3 text-sm text-white">
          {destaque ? resumo(destaque) : "Inicie a reprodução para acompanhar o percurso."}
        </p>
        <details>
          <summary className="cursor-pointer py-2 text-sm font-semibold text-[#ffd333]">Ver todos os passos registrados</summary>
          <ol className="mt-2 max-h-72 space-y-1 overflow-y-auto">
            {passos.map((passo, i) => (
              <li key={i} className={"rounded-md p-2 text-sm " + (i === indice ? "bg-[#35506b] text-white" : "text-slate-300")}>
                <span className="mr-2 font-mono text-[#ffd333]">{tempo(passo.t)}</span>
                {resumo(passo)}
              </li>
            ))}
          </ol>
        </details>
      </div>
    ) : <p className="text-xs text-slate-400">Esta gravação não contém dados de percurso.</p>}
  </div>;
}
