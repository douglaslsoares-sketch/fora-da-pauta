"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAvaliacaoVoz } from "@/components/politicos/AvaliacaoVozProvider";

export function FormularioAvaliacaoPoliticos() {
  const voz = useAvaliacaoVoz();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [recebido, setRecebido] = useState(false);

  const gravando = ["solicitando", "gravando", "pausado", "finalizando"].includes(voz.estado);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!voz.audio || voz.estado !== "finalizado" || enviando) return;
    setEnviando(true);
    setErro("");
    try {
      const dados = new FormData();
      const extensao = voz.audio.type.includes("mp4") ? ".m4a" :
        voz.audio.type.includes("ogg") ? ".ogg" : ".webm";
      dados.set("audio", voz.audio, "avaliacao" + extensao);
      dados.set("duracao", String(voz.segundos));
      const resposta = await fetch("/api/politicos/avaliacoes/voz", {
        method: "POST", body: dados, credentials: "same-origin",
      });
      const corpo = await resposta.json().catch(() => ({})) as { erro?: string };
      if (!resposta.ok) throw Error(corpo.erro || "Não foi possível enviar sua avaliação.");
      voz.descartar();
      setRecebido(true);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível enviar sua avaliação.");
    } finally {
      setEnviando(false);
    }
  }

  if (recebido) return (
    <section className="rounded-2xl border border-emerald-500/50 bg-[#153849] p-6 text-center">
      <div aria-hidden="true" className="text-4xl text-[#ffd333]">✓</div>
      <h2 className="mt-3 text-2xl font-bold text-white">Feedback recebido!</h2>
      <p className="mt-3 leading-7 text-slate-200">Obrigado por compartilhar sua experiência. Vamos ouvir sua gravação para melhorar o Políticos.</p>
      <Link href="/politicos" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#ffd333] px-6 font-bold text-[#071827]">Voltar ao aplicativo</Link>
    </section>
  );

  return (
    <form onSubmit={enviar} className="space-y-5 rounded-2xl border border-[#36516a] bg-[#162d44] p-5 sm:p-7">
      <h2 className="text-xl font-bold text-white">Conte sua experiência por voz</h2>
      <p className="text-base leading-7 text-slate-200">
        Toque em <strong>Iniciar gravação</strong>, navegue pelo aplicativo e fale o que gostou, o que teve dificuldade e o que podemos melhorar.
      </p>

      {voz.estado === "pronto" && (
        <button type="button" onClick={() => void voz.iniciar()} className="min-h-14 w-full rounded-xl bg-[#ffd333] px-5 py-3 text-lg font-bold text-[#071827]">
          🎙 Iniciar gravação
        </button>
      )}
      {voz.estado === "solicitando" && <p role="status" className="text-slate-200">Aguardando autorização do microfone...</p>}

      {gravando && (
        <div className="space-y-3 rounded-xl border border-[#ffd333]/40 p-4">
          <p role="status" className="font-bold text-[#ffd333]">
            {voz.estado === "gravando" ? "Gravação em andamento" :
              voz.estado === "pausado" ? "Gravação pausada" : "Preparando gravação"}
          </p>
          <p className="text-sm leading-6 text-slate-200">O controle de gravação permanece na parte inferior enquanto você navega pelas páginas do Políticos.</p>
          <Link href="/politicos" className="flex min-h-12 items-center justify-center rounded-xl border border-[#ffd333] px-4 text-center font-bold text-[#ffd333]">
            Ir para o aplicativo e continuar falando
          </Link>
        </div>
      )}

      {voz.estado === "finalizado" && voz.audioUrl && (
        <div className="space-y-4 rounded-xl border border-[#ffd333]/40 p-4">
          <p className="text-lg font-bold text-[#ffd333]">Gravação concluída</p>
          <p className="text-sm leading-6 text-slate-200">Ouça seu feedback antes de enviar. Você pode descartar e gravar novamente.</p>
          <audio controls preload="metadata" src={voz.audioUrl} className="w-full" aria-label="Ouvir sua avaliação gravada" />
          <button type="submit" disabled={enviando} className="min-h-12 w-full rounded-xl bg-[#ffd333] px-5 py-3 text-lg font-bold text-[#071827] disabled:opacity-50">
            {enviando ? "Enviando..." : "Enviar feedback em áudio"}
          </button>
          <button type="button" disabled={enviando} onClick={voz.descartar} className="min-h-11 w-full rounded-xl border border-[#8194aa] px-4 py-2 font-semibold text-white disabled:opacity-50">
            Descartar e gravar novamente
          </button>
        </div>
      )}

      <p className="text-sm leading-6 text-slate-300">
        Gravação de até 5 minutos. Você não precisa informar seu nome ou telefone.
        Nada é enviado até tocar em <strong>Enviar feedback em áudio</strong>.
        Evite citar informações pessoais. Não saia do site nem abra outro aplicativo durante a gravação, pois o navegador pode interromper o microfone.
      </p>
      {(erro || voz.erro) && <p role="alert" className="rounded-xl border border-red-500/60 bg-red-950/40 p-3 text-sm text-white">{erro || voz.erro}</p>}
    </form>
  );
}
