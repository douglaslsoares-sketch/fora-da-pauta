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
      const video = voz.modo === "tela";
      const extensao = voz.audio.type.includes("mp4") ? (video ? ".mp4" : ".m4a")
        : voz.audio.type.includes("ogg") ? ".ogg" : ".webm";
      dados.set("audio", voz.audio, "feedback" + extensao);
      dados.set("duracao", String(voz.segundos));
      dados.set("percurso", JSON.stringify(voz.percurso));
      const resposta = await fetch("/api/politicos/avaliacoes/voz", {
        method: "POST", body: dados, credentials: "same-origin",
      });
      const corpo = await resposta.json().catch(() => ({})) as { erro?: string };
      if (!resposta.ok) throw Error(corpo.erro || "Não foi possível enviar seu feedback.");
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
      <p className="mt-3 leading-7 text-slate-200">Obrigado! Sua gravação e o percurso autorizado foram recebidos para melhorar o aplicativo.</p>
      <Link href="/politicos" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#ffd333] px-6 font-bold text-[#071827]">Voltar ao aplicativo</Link>
    </section>
  );

  return (
    <form onSubmit={enviar} className="space-y-5 rounded-2xl border border-[#36516a] bg-[#162d44] p-5 sm:p-7">
      <h2 className="text-xl font-bold text-white">Conte sua experiência enquanto navega</h2>
      <p className="text-base leading-7 text-slate-200">
        Escolha como registrar seu feedback. Você pode explorar as páginas e falar sobre as dificuldades encontradas.
      </p>

      {voz.estado === "pronto" && <div className="space-y-3">
        <button type="button" onClick={() => void voz.iniciar("percurso")}
          className="min-h-14 w-full rounded-xl bg-[#ffd333] px-5 py-3 text-base font-bold text-[#071827]">
          🎙 Gravar voz e percurso
        </button>
        <p className="text-sm leading-6 text-slate-300">
          Recomendado no celular. Grava sua voz e registra páginas, ações genéricas e rolagem, sem copiar textos digitados.
          O percurso não é um vídeo nem uma reprodução visual exata da tela.
        </p>
        <button type="button" onClick={() => void voz.iniciar("tela")}
          className="min-h-12 w-full rounded-xl border border-[#ffd333] px-4 py-3 text-sm font-bold text-[#ffd333]">
          ◉ Gravar aba e voz (quando disponível)
        </button>
        <p className="text-sm leading-6 text-slate-300">
          Para navegadores de computador compatíveis. Na janela de permissão, selecione apenas a aba do Políticos.
          Não compartilhe a tela inteira, outras abas ou aplicativos. Limite de 2 minutos.
        </p>
      </div>}

      {voz.estado === "solicitando" && <p role="status" className="text-slate-200">Aguardando autorização do navegador...</p>}

      {gravando && <div className="space-y-3 rounded-xl border border-[#ffd333]/40 p-4">
        <p role="status" className="font-bold text-[#ffd333]">
          {voz.estado === "gravando" ? "Gravação em andamento" :
            voz.estado === "pausado" ? "Gravação pausada" : "Preparando gravação"}
        </p>
        <p className="text-sm leading-6 text-slate-200">
          O controle de gravação permanece na parte inferior. Continue navegando no Políticos e fale à vontade.
        </p>
        <Link href="/politicos" className="flex min-h-12 items-center justify-center rounded-xl border border-[#ffd333] px-4 text-center font-bold text-[#ffd333]">
          Navegar pelo aplicativo
        </Link>
      </div>}

      {voz.estado === "finalizado" && voz.audioUrl && <div className="space-y-4 rounded-xl border border-[#ffd333]/40 p-4">
        <p className="text-lg font-bold text-[#ffd333]">Gravação concluída</p>
        <p className="text-sm leading-6 text-slate-200">Confira o que foi gravado. Envie somente se estiver de acordo.</p>
        {voz.modo === "tela"
          ? <video controls playsInline preload="metadata" src={voz.audioUrl} className="max-h-72 w-full rounded-lg bg-black" aria-label="Prévia da aba e voz gravadas"/>
          : <audio controls preload="metadata" src={voz.audioUrl} className="w-full" aria-label="Ouvir seu feedback"/>}
        <p className="text-sm text-slate-300">{voz.percurso.length} eventos de navegação registrados junto com a voz.</p>
        <button type="submit" disabled={enviando}
          className="min-h-12 w-full rounded-xl bg-[#ffd333] px-5 py-3 text-base font-bold text-[#071827] disabled:opacity-50">
          {enviando ? "Enviando..." : "Enviar feedback"}
        </button>
        <button type="button" disabled={enviando} onClick={voz.descartar}
          className="min-h-11 w-full rounded-xl border border-[#8194aa] px-4 py-2 font-semibold text-white disabled:opacity-50">
          Descartar gravação
        </button>
      </div>}

      <p className="text-sm leading-6 text-slate-300">
        A gravação começa somente após sua escolha e permissão. O microfone grava sua voz;
        no modo vídeo, a aba selecionada também aparece no arquivo.
        O percurso registra caminhos e interações genéricas, sem textos digitados ou conteúdo de campos.
        O material fica disponível somente na administração para melhorar o produto.
        Nada é enviado até você tocar em <strong>Enviar feedback</strong>.
        Evite compartilhar dados pessoais. Ao sair do site ou trocar de aplicativo, o navegador pode interromper a captura.
      </p>
      {(erro || voz.erro) && <p role="alert" className="rounded-xl border border-red-500/60 bg-red-950/40 p-3 text-sm text-white">{erro || voz.erro}</p>}
    </form>
  );
}
