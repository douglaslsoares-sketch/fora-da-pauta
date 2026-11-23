"use client";

import {
  createContext, useContext, useEffect, useRef, useState,
  type ReactNode,
} from "react";
import Link from "next/link";

export type EstadoGravacao = "pronto" | "solicitando" | "gravando" | "pausado" | "finalizando" | "finalizado";

type ContextoVoz = {
  estado: EstadoGravacao;
  audio: Blob | null;
  audioUrl: string | null;
  segundos: number;
  erro: string;
  iniciar: () => Promise<void>;
  pausar: () => void;
  continuar: () => void;
  finalizar: () => void;
  descartar: () => void;
};

const Contexto = createContext<ContextoVoz | null>(null);
const LIMITE_SEGUNDOS = 300;
const LIMITE_BYTES = 3_000_000;

function formatarTempo(segundos: number) {
  return String(Math.floor(segundos / 60)).padStart(2, "0") + ":" +
    String(segundos % 60).padStart(2, "0");
}

export function useAvaliacaoVoz() {
  const contexto = useContext(Contexto);
  if (!contexto) throw Error("Gravador fora do aplicativo Políticos.");
  return contexto;
}

export function AvaliacaoVozProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoGravacao>("pronto");
  const [segundos, setSegundos] = useState(0);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const gravadorRef = useRef<MediaRecorder | null>(null);
  const microfoneRef = useRef<MediaStream | null>(null);
  const partesRef = useRef<Blob[]>([]);
  const ativoRef = useRef(true);
  const descartarRef = useRef(false);

  useEffect(() => {
    return () => {
      ativoRef.current = false;
      const gravador = gravadorRef.current;
      if (gravador && gravador.state !== "inactive") {
        gravador.onstop = null;
        gravador.ondataavailable = null;
        gravador.stop();
      }
      microfoneRef.current?.getTracks().forEach(trilha => trilha.stop());
    };
  }, []);

  useEffect(() => {
    if (!audio) {
      setAudioUrl(null);
      return;
    }
    const url = URL.createObjectURL(audio);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audio]);

  useEffect(() => {
    if (estado !== "gravando") return;
    const intervalo = window.setInterval(() => setSegundos(atual => atual + 1), 1000);
    return () => window.clearInterval(intervalo);
  }, [estado]);

  useEffect(() => {
    if (segundos >= LIMITE_SEGUNDOS && estado === "gravando") {
      const gravador = gravadorRef.current;
      if (gravador?.state === "recording") {
        setEstado("finalizando");
        gravador.stop();
      }
    }
  }, [segundos, estado]);

  useEffect(() => {
    if (estado === "pronto") return;
    const avisoSaida = (evento: BeforeUnloadEvent) => {
      evento.preventDefault();
      evento.returnValue = "";
    };
    window.addEventListener("beforeunload", avisoSaida);
    return () => window.removeEventListener("beforeunload", avisoSaida);
  }, [estado]);

  async function iniciar() {
    if (["gravando", "pausado", "finalizando", "solicitando"].includes(estado)) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setErro("Este navegador não suporta gravação de voz. Use um navegador atualizado com acesso ao microfone.");
      return;
    }

    setEstado("solicitando");
    setErro("");
    setAudio(null);
    setSegundos(0);
    partesRef.current = [];
    descartarRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      if (!ativoRef.current) {
        stream.getTracks().forEach(trilha => trilha.stop());
        return;
      }
      microfoneRef.current = stream;
      const formatos = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg;codecs=opus"];
      const formato = formatos.find(item => MediaRecorder.isTypeSupported(item));
      const gravador = new MediaRecorder(stream, {
        ...(formato ? { mimeType: formato } : {}),
        audioBitsPerSecond: 48_000,
      });
      gravadorRef.current = gravador;
      gravador.ondataavailable = (evento: BlobEvent) => {
        if (evento.data.size) partesRef.current.push(evento.data);
      };
      gravador.onerror = () => {
        setErro("Houve uma falha durante a gravação. Tente novamente.");
        if (gravador.state !== "inactive") gravador.stop();
      };
      gravador.onstop = () => {
        microfoneRef.current?.getTracks().forEach(trilha => trilha.stop());
        microfoneRef.current = null;
        gravadorRef.current = null;
        if (!ativoRef.current || descartarRef.current) return;
        const arquivo = new Blob(partesRef.current, {
          type: gravador.mimeType || partesRef.current[0]?.type || "audio/webm",
        });
        partesRef.current = [];
        if (arquivo.size < 800) {
          setErro("A gravação ficou vazia. Tente novamente.");
          setEstado("pronto");
        } else if (arquivo.size > LIMITE_BYTES) {
          setErro("A gravação ultrapassou 3 MB. Grave um áudio mais curto.");
          setEstado("pronto");
        } else {
          setAudio(arquivo);
          setEstado("finalizado");
        }
      };
      gravador.start(1000);
      setEstado("gravando");
    } catch (e) {
      microfoneRef.current?.getTracks().forEach(trilha => trilha.stop());
      microfoneRef.current = null;
      setEstado("pronto");
      setErro(e instanceof DOMException && e.name === "NotAllowedError"
        ? "Permita o acesso ao microfone para gravar sua avaliação."
        : "Não foi possível ativar o microfone. Verifique as permissões do navegador.");
    }
  }

  function pausar() {
    if (gravadorRef.current?.state !== "recording") return;
    gravadorRef.current.pause();
    setEstado("pausado");
  }

  function continuar() {
    if (gravadorRef.current?.state !== "paused") return;
    gravadorRef.current.resume();
    setEstado("gravando");
  }

  function finalizar() {
    const gravador = gravadorRef.current;
    if (gravador && gravador.state !== "inactive") {
      setEstado("finalizando");
      gravador.stop();
    }
  }

  function descartar() {
    descartarRef.current = true;
    const gravador = gravadorRef.current;
    if (gravador && gravador.state !== "inactive") {
      gravador.onstop = null;
      gravador.ondataavailable = null;
      gravador.stop();
    }
    gravadorRef.current = null;
    microfoneRef.current?.getTracks().forEach(trilha => trilha.stop());
    microfoneRef.current = null;
    partesRef.current = [];
    setAudio(null);
    setSegundos(0);
    setEstado("pronto");
    setErro("");
  }

  const contexto: ContextoVoz = {
    estado, audio, audioUrl, segundos, erro,
    iniciar, pausar, continuar, finalizar, descartar,
  };
  const exibirControle = ["gravando", "pausado", "finalizando", "finalizado"].includes(estado);

  return (
    <Contexto.Provider value={contexto}>
      {children}
      {exibirControle && (
        <>
          <div aria-hidden="true" className="h-28 bg-[#071827]" />
          <aside aria-label="Gravador de avaliação" className="fixed bottom-3 left-3 right-3 z-[90] mx-auto max-w-[470px] rounded-2xl border-2 border-[#ffd333] bg-[#071827] p-3 text-white shadow-[0_8px_32px_rgba(0,0,0,.65)]">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className={estado === "gravando" ? "h-3 w-3 animate-pulse rounded-full bg-red-500" : "h-3 w-3 rounded-full bg-[#ffd333]"} />
                <p className="text-sm font-bold">
                  {estado === "gravando" ? "Gravando sua avaliação" :
                    estado === "pausado" ? "Gravação pausada" :
                    estado === "finalizando" ? "Preparando áudio" : "Áudio pronto"}
                </p>
              </div>
              <span className="font-mono text-sm font-semibold tabular-nums">{formatarTempo(segundos)}</span>
            </div>
            {estado === "gravando" && (
              <div className="flex gap-2">
                <button type="button" onClick={pausar} className="min-h-11 flex-1 rounded-lg border border-[#8ca1b4] px-3 py-2 text-sm font-bold">Pausar</button>
                <button type="button" onClick={finalizar} className="min-h-11 flex-1 rounded-lg bg-[#ffd333] px-3 py-2 text-sm font-bold text-[#071827]">Concluir</button>
              </div>
            )}
            {estado === "pausado" && (
              <div className="flex gap-2">
                <button type="button" onClick={continuar} className="min-h-11 flex-1 rounded-lg border border-[#8ca1b4] px-3 py-2 text-sm font-bold">Continuar</button>
                <button type="button" onClick={finalizar} className="min-h-11 flex-1 rounded-lg bg-[#ffd333] px-3 py-2 text-sm font-bold text-[#071827]">Concluir</button>
              </div>
            )}
            {estado === "finalizado" && (
              <div className="flex gap-2">
                <Link href="/politicos/avaliar" className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-[#ffd333] px-3 py-2 text-center text-sm font-bold text-[#071827]">Ouvir e enviar</Link>
                <button type="button" onClick={descartar} className="min-h-11 rounded-lg border border-[#8ca1b4] px-3 py-2 text-sm font-semibold">Descartar</button>
              </div>
            )}
            {estado === "finalizando" && <p role="status" className="text-sm text-slate-200">Finalizando...</p>}
          </aside>
        </>
      )}
    </Contexto.Provider>
  );
}
