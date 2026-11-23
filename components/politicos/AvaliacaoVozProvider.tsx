"use client";

import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Modo = "percurso" | "tela";
type Estado = "pronto" | "solicitando" | "gravando" | "pausado" | "finalizando" | "finalizado";
export type Passo = { t: number; tipo: "pagina" | "acao" | "rolagem"; pagina: string; detalhe?: string; porcentagem?: number };
type ContextoVoz = {
  estado: Estado;
  modo: Modo;
  audio: Blob | null;
  audioUrl: string | null;
  segundos: number;
  percurso: Passo[];
  erro: string;
  iniciar: (modo: Modo) => Promise<void>;
  pausar: () => void;
  continuar: () => void;
  finalizar: () => void;
  descartar: () => void;
};

const Contexto = createContext<ContextoVoz | null>(null);
const LIMITE_AUDIO = 3_000_000;
const LIMITE_VIDEO = 3_400_000;
const LIMITE_PASSOS = 220;

function tempo(s: number) {
  return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}

function paginaSegura(caminho: string) {
  // Somente rotas públicas do Políticos; nunca inclui URL externa, busca ou texto digitado.
  if (/^\/politicos(?:\/(?:escolher|acompanhados|historico(?:\/[0-9]{8,20})?|avisos|qr-code|compartilhar|avaliar|sobre|loja))?\/?$/.test(caminho)) {
    return caminho.replace(/\/$/, "") || "/politicos";
  }
  return "/politicos/outra-pagina";
}

function acaoSegura(texto: string) {
  const bruto = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  if (bruto.includes("deixar de acompanhar")) return "Deixar de acompanhar";
  if (bruto.includes("ver historico")) return "Ver histórico";
  if (bruto.includes("acompanhar")) return "Acompanhar";
  if (bruto.includes("voltar")) return "Voltar";
  if (bruto.includes("mostrar mais")) return "Mostrar mais resultados";
  if (bruto.includes("recentes primeiro")) return "Ordenar: mais recentes";
  if (bruto.includes("antigos primeiro")) return "Ordenar: mais antigos";
  if (bruto.includes("escolher um politico")) return "Abrir escolha de político";
  if (bruto.includes("politicos que eu acompanho")) return "Abrir acompanhados";
  if (bruto.includes("historico de um politico")) return "Abrir histórico";
  if (bruto.includes("compartilhar")) return "Compartilhar";
  return "Toque em um controle";
}

export function useAvaliacaoVoz() {
  const valor = useContext(Contexto);
  if (!valor) throw Error("Gravador fora do Políticos.");
  return valor;
}

export function AvaliacaoVozProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [estado, setEstado] = useState<Estado>("pronto");
  const estadoRef = useRef<Estado>("pronto");
  const [modo, setModo] = useState<Modo>("percurso");
  const [segundos, setSegundos] = useState(0);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [percurso, setPercurso] = useState<Passo[]>([]);
  const [erro, setErro] = useState("");
  const gravadorRef = useRef<MediaRecorder | null>(null);
  const microfoneRef = useRef<MediaStream | null>(null);
  const telaRef = useRef<MediaStream | null>(null);
  const partesRef = useRef<Blob[]>([]);
  const passosRef = useRef<Passo[]>([]);
  const origemTempoRef = useRef(0);
  const tempoPausadoRef = useRef(0);
  const inicioPausaRef = useRef<number | null>(null);
  const rotaRef = useRef(pathname);
  const descartarRef = useRef(false);
  const ativoRef = useRef(true);
  const modoRef = useRef<Modo>("percurso");
  const ultimaRolagemRef = useRef(0);

  function mudarEstado(valor: Estado) {
    estadoRef.current = valor;
    setEstado(valor);
  }

  const tempoAtivo = useCallback(() => {
    const agora = performance.now();
    const pausaAtual = inicioPausaRef.current === null ? 0 : agora - inicioPausaRef.current;
    return Math.max(0, agora - origemTempoRef.current - tempoPausadoRef.current - pausaAtual);
  }, []);

  const registrar = useCallback((passo: Omit<Passo, "t">) => {
    if (estadoRef.current !== "gravando") return;
    const t = Math.round(tempoAtivo());
    const anterior = passosRef.current.at(-1);
    if (passosRef.current.length >= LIMITE_PASSOS) return;
    if (anterior && anterior.tipo === passo.tipo && anterior.pagina === passo.pagina &&
      anterior.detalhe === passo.detalhe && anterior.porcentagem === passo.porcentagem && t - anterior.t < 1200) return;
    const atual = { ...passo, t };
    passosRef.current.push(atual);
    setPercurso([...passosRef.current]);
  }, [tempoAtivo]);

  useEffect(() => {
    ativoRef.current = true;
    return () => {
      ativoRef.current = false;
      const gravador = gravadorRef.current;
      if (gravador && gravador.state !== "inactive") {
        gravador.onstop = null;
        gravador.ondataavailable = null;
        gravador.stop();
      }
      microfoneRef.current?.getTracks().forEach(t => t.stop());
      telaRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!audio) { setAudioUrl(null); return; }
    const url = URL.createObjectURL(audio);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audio]);

  useEffect(() => {
    rotaRef.current = pathname;
    if (estadoRef.current === "gravando") registrar({ tipo: "pagina", pagina: paginaSegura(pathname) });
  }, [pathname, registrar]);

  useEffect(() => {
    function toque(evento: MouseEvent) {
      if (estadoRef.current !== "gravando") return;
      const alvo = evento.target;
      if (!(alvo instanceof Element)) return;
      if (alvo.closest("input,textarea,select,[contenteditable='true'],[data-feedback-gravador]")) return;
      const botao = alvo.closest("button,a,[role='button']");
      if (!botao || botao.closest("[data-feedback-gravador]")) return;
      const nome = botao.getAttribute("aria-label") || botao.textContent || "";
      registrar({ tipo: "acao", pagina: paginaSegura(rotaRef.current), detalhe: acaoSegura(nome) });
    }
    function rolagem() {
      if (estadoRef.current !== "gravando" || performance.now() - ultimaRolagemRef.current < 1600) return;
      ultimaRolagemRef.current = performance.now();
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const porcentagem = total > 0 ? Math.min(100, Math.max(0, Math.round(100 * window.scrollY / total))) : 0;
      registrar({ tipo: "rolagem", pagina: paginaSegura(rotaRef.current), porcentagem });
    }
    document.addEventListener("click", toque, true);
    window.addEventListener("scroll", rolagem, { passive: true });
    return () => {
      document.removeEventListener("click", toque, true);
      window.removeEventListener("scroll", rolagem);
    };
  }, [registrar]);

  useEffect(() => {
    if (estado !== "gravando") return;
    const intervalo = window.setInterval(() => {
      const valor = Math.floor(tempoAtivo() / 1000);
      setSegundos(valor);
      const limite = modoRef.current === "tela" ? 120 : 300;
      if (valor >= limite && gravadorRef.current?.state === "recording") {
        mudarEstado("finalizando");
        gravadorRef.current.stop();
      }
    }, 500);
    return () => window.clearInterval(intervalo);
  }, [estado, tempoAtivo]);

  useEffect(() => {
    if (estado === "pronto") return;
    const aviso = (evento: BeforeUnloadEvent) => {
      evento.preventDefault();
      evento.returnValue = "";
    };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [estado]);

  async function iniciar(escolha: Modo) {
    if (estadoRef.current !== "pronto" && estadoRef.current !== "finalizado") return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setErro("Este navegador não permite gravar o microfone. Use um navegador atualizado.");
      return;
    }
    if (escolha === "tela" && !navigator.mediaDevices.getDisplayMedia) {
      setErro("Este navegador não oferece captura de tela. Escolha Voz + percurso.");
      return;
    }

    mudarEstado("solicitando");
    setErro("");
    setAudio(null);
    setSegundos(0);
    setModo(escolha);
    modoRef.current = escolha;
    partesRef.current = [];
    passosRef.current = [];
    setPercurso([]);
    descartarRef.current = false;

    try {
      // A escolha da aba é feita diretamente pelo navegador e depende de consentimento.
      let captura: MediaStream | null = null;
      if (escolha === "tela") {
        captura = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 8 }, audio: false });
        telaRef.current = captura;
        // Impede gravar janelas inteiras ou o monitor quando a informação é fornecida.
        const superficie = captura.getVideoTracks()[0]?.getSettings().displaySurface;
        if (superficie && superficie !== "browser") {
          captura.getTracks().forEach(t => t.stop());
          telaRef.current = null;
          throw Error("Selecione apenas a aba do Políticos, e não a tela inteira.");
        }
      }
      const microfone = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      if (!ativoRef.current) {
        microfone.getTracks().forEach(t => t.stop());
        captura?.getTracks().forEach(t => t.stop());
        return;
      }
      microfoneRef.current = microfone;
      const trilhas = escolha === "tela"
        ? [...(captura?.getVideoTracks() || []), ...microfone.getAudioTracks()]
        : [...microfone.getAudioTracks()];
      const formatos = escolha === "tela"
        ? ["video/webm;codecs=vp8,opus", "video/webm", "video/mp4"]
        : ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg;codecs=opus"];
      const formato = formatos.find(f => MediaRecorder.isTypeSupported(f));
      if (!formato) throw Error("Não foi encontrado um formato de gravação compatível.");
      const gravador = new MediaRecorder(new MediaStream(trilhas), {
        mimeType: formato,
        audioBitsPerSecond: escolha === "tela" ? 32_000 : 48_000,
        ...(escolha === "tela" ? { videoBitsPerSecond: 160_000 } : {}),
      });
      gravadorRef.current = gravador;
      origemTempoRef.current = performance.now();
      tempoPausadoRef.current = 0;
      inicioPausaRef.current = null;
      gravador.ondataavailable = evento => {
        if (evento.data.size) partesRef.current.push(evento.data);
      };
      gravador.onerror = () => {
        setErro("Houve uma falha durante a gravação. Tente novamente.");
        if (gravador.state !== "inactive") gravador.stop();
      };
      gravador.onstop = () => {
        microfoneRef.current?.getTracks().forEach(t => t.stop());
        telaRef.current?.getTracks().forEach(t => t.stop());
        microfoneRef.current = null;
        telaRef.current = null;
        gravadorRef.current = null;
        if (!ativoRef.current || descartarRef.current) return;
        const blob = new Blob(partesRef.current, { type: gravador.mimeType });
        partesRef.current = [];
        setSegundos(Math.max(1, Math.ceil(tempoAtivo() / 1000)));
        if (blob.size < 800) {
          setErro("A gravação ficou vazia. Tente novamente.");
          mudarEstado("pronto");
        } else if (blob.size > (escolha === "tela" ? LIMITE_VIDEO : LIMITE_AUDIO)) {
          setErro("A gravação excedeu o tamanho permitido. Tente gravar por menos tempo.");
          mudarEstado("pronto");
        } else {
          setAudio(blob);
          setPercurso([...passosRef.current]);
          mudarEstado("finalizado");
        }
      };
      captura?.getVideoTracks().forEach(t => {
        t.onended = () => {
          if (gravador.state !== "inactive") {
            mudarEstado("finalizando");
            gravador.stop();
          }
        };
      });
      gravador.start(1000);
      mudarEstado("gravando");
      registrar({ tipo: "pagina", pagina: paginaSegura(rotaRef.current) });
    } catch (e) {
      microfoneRef.current?.getTracks().forEach(t => t.stop());
      telaRef.current?.getTracks().forEach(t => t.stop());
      microfoneRef.current = null;
      telaRef.current = null;
      mudarEstado("pronto");
      setErro(e instanceof DOMException && e.name === "NotAllowedError"
        ? "Permita o microfone e, se escolher vídeo, compartilhe apenas a aba do Políticos."
        : e instanceof Error ? e.message : "Não foi possível iniciar a gravação.");
    }
  }

  function pausar() {
    const gravador = gravadorRef.current;
    if (gravador?.state !== "recording") return;
    inicioPausaRef.current = performance.now();
    gravador.pause();
    mudarEstado("pausado");
  }

  function continuar() {
    const gravador = gravadorRef.current;
    if (gravador?.state !== "paused") return;
    if (inicioPausaRef.current !== null) tempoPausadoRef.current += performance.now() - inicioPausaRef.current;
    inicioPausaRef.current = null;
    gravador.resume();
    mudarEstado("gravando");
  }

  function finalizar() {
    const gravador = gravadorRef.current;
    if (gravador && gravador.state !== "inactive") {
      if (inicioPausaRef.current !== null) {
        tempoPausadoRef.current += performance.now() - inicioPausaRef.current;
        inicioPausaRef.current = null;
      }
      mudarEstado("finalizando");
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
    microfoneRef.current?.getTracks().forEach(t => t.stop());
    telaRef.current?.getTracks().forEach(t => t.stop());
    gravadorRef.current = null;
    microfoneRef.current = null;
    telaRef.current = null;
    partesRef.current = [];
    passosRef.current = [];
    setAudio(null);
    setPercurso([]);
    setSegundos(0);
    setErro("");
    mudarEstado("pronto");
  }

  const contexto: ContextoVoz = {
    estado, modo, audio, audioUrl, segundos, percurso, erro,
    iniciar, pausar, continuar, finalizar, descartar,
  };
  const mostrar = ["gravando", "pausado", "finalizando", "finalizado"].includes(estado);
  return (
    <Contexto.Provider value={contexto}>
      {children}
      {mostrar && (
        <>
          <div aria-hidden="true" className="h-28 bg-[#071827]" />
          <aside data-feedback-gravador aria-label="Gravador de avaliação" className="fixed bottom-3 left-3 right-3 z-[90] mx-auto max-w-[470px] rounded-2xl border-2 border-[#ffd333] bg-[#071827] p-3 text-white shadow-[0_8px_32px_rgba(0,0,0,.65)]">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className={estado === "gravando" ? "h-3 w-3 animate-pulse rounded-full bg-red-500" : "h-3 w-3 rounded-full bg-[#ffd333]"} />
                <p className="text-sm font-bold">
                  {estado === "gravando" ? (modo === "tela" ? "Gravando tela e voz" : "Gravando voz e percurso") :
                    estado === "pausado" ? "Gravação pausada" :
                    estado === "finalizando" ? "Preparando gravação" : "Gravação pronta"}
                </p>
              </div>
              <span className="font-mono text-sm font-semibold tabular-nums">{tempo(segundos)}</span>
            </div>
            {estado === "gravando" && <div className="flex gap-2">
              <button type="button" onClick={pausar} className="min-h-11 flex-1 rounded-lg border border-[#8ca1b4] px-3 py-2 text-sm font-bold">Pausar</button>
              <button type="button" onClick={finalizar} className="min-h-11 flex-1 rounded-lg bg-[#ffd333] px-3 py-2 text-sm font-bold text-[#071827]">Concluir</button>
            </div>}
            {estado === "pausado" && <div className="flex gap-2">
              <button type="button" onClick={continuar} className="min-h-11 flex-1 rounded-lg border border-[#8ca1b4] px-3 py-2 text-sm font-bold">Continuar</button>
              <button type="button" onClick={finalizar} className="min-h-11 flex-1 rounded-lg bg-[#ffd333] px-3 py-2 text-sm font-bold text-[#071827]">Concluir</button>
            </div>}
            {estado === "finalizado" && <div className="flex gap-2">
              <Link href="/politicos/avaliar" className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-[#ffd333] px-3 py-2 text-center text-sm font-bold text-[#071827]">Ouvir e enviar</Link>
              <button type="button" onClick={descartar} className="min-h-11 rounded-lg border border-[#8ca1b4] px-3 py-2 text-sm font-semibold">Descartar</button>
            </div>}
            {estado === "finalizando" && <p role="status" className="text-sm text-slate-200">Finalizando...</p>}
          </aside>
        </>
      )}
    </Contexto.Provider>
  );
}
