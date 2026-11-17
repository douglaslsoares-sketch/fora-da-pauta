"use client";

import Image from "next/image";
import { LogoForaDaPauta } from "@/components/LogoForaDaPauta";
import { OrientacoesInstalacaoTelegram, type PlataformaTelegram } from "@/components/OrientacoesInstalacaoTelegram";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CandidateSelector } from "@/components/CandidateSelector";
import { InscricaoNecessariaModal } from "@/components/InscricaoNecessariaModal";
import { CandidatePhoto } from "@/components/CandidatePhoto";
import { InstalarAplicativo } from "@/components/InstalarAplicativo";
import { SeloTelegram } from "@/components/SeloTelegram";
import { chaveNovidade } from "@/components/RegistrarNovidadeVista";
import styles from "@/app/page.module.css";

type PessoaAcompanhada = { id: string; nomeUrna: string };
type Situacao = {
  ativo?: boolean;
  ids?: string[];
  pessoas?: PessoaAcompanhada[];
};
type Opcao = {
  titulo: string;
  descricao: string;
  href: string;
  exigeEscolhas?: boolean;
  novidade?: "edicoes" | "entregas";
};

const opcoes: Opcao[] = [
  {
    titulo: "Minhas escolhas",
    descricao: "Veja ou remova pessoas acompanhadas.",
    href: "/votou-fique-de-olho?minhas=1",
    exigeEscolhas: true,
  },
  {
    titulo: "Ficha política",
    descricao: "Pesquise e consulte uma ficha.",
    href: "/ficha-politica",
  },
  {
    titulo: "Entregas do governo",
    novidade: "entregas",
    descricao: "Acompanhe entregas e ações do governo federal.",
    href: "/entregas-do-governo",
  },
  {
    titulo: "O dia do presidente",
    descricao: "Consulte o histórico de atividades públicas do presidente.",
    href: "/o-dia-do-presidente",
  },
  {
    titulo: "Edições já publicadas",
    novidade: "edicoes",
    descricao: "Leia ou ouça as edições.",
    href: "/edicoes",
  },
  {
    titulo: "Camiseta Fora da Pauta",
    descricao: "Ajude a financiar o projeto.",
    href: "/camiseta",
  },
];

export function HomeAcessoTelegram({ versaoEdicoes, versaoEntregas, pagina = "inicio" }: { versaoEdicoes: string | null; versaoEntregas: string | null; pagina?: "inicio" | "opcoes" }) {
  const [situacao, setSituacao] = useState<"verificando" | "inscrito" | "visitante">("verificando");
  const [ids, setIds] = useState<string[]>([]);
  const [pessoas, setPessoas] = useState<PessoaAcompanhada[]>([]);
  const [simulacao, setSimulacao] = useState(false);
  const [simuladoInscrito, setSimuladoInscrito] = useState(false);
  const [abrindoTelegram, setAbrindoTelegram] = useState(false);
  const [comandoInscricaoPendente, setComandoInscricaoPendente] = useState("");
  const [comandoInscricaoCopiado, setComandoInscricaoCopiado] = useState(false);
  const [erroCopiaComando, setErroCopiaComando] = useState(false);
  const [mostrarOrientacoesTelegram, setMostrarOrientacoesTelegram] = useState(false);
  const [precisaInstalarTelegram, setPrecisaInstalarTelegram] = useState(false);
  const [jaTemTelegram, setJaTemTelegram] = useState(false);
  const [plataformaTelegram, setPlataformaTelegram] = useState<PlataformaTelegram>("outro");
  const [erroTelegram, setErroTelegram] = useState("");
  const [salvandoEscolha, setSalvandoEscolha] = useState(false);
  const [avisoInscricaoAberto, setAvisoInscricaoAberto] = useState(false);
  const [erroEscolha, setErroEscolha] = useState("");
  const [confirmadoAgora, setConfirmadoAgora] = useState<PessoaAcompanhada | null>(null);
  const [busca, setBusca] = useState(0);
  const [novidades, setNovidades] = useState({ edicoes: false, entregas: false });
  const areaAcompanhamento = useRef<HTMLElement>(null);

  const orientacaoTelegramRef = useRef<HTMLDivElement>(null);

  // Ao abrir a inscrição pela home, traz as opções recém-exibidas para a tela.
  useEffect(() => {
    if (pagina !== "inicio" || !mostrarOrientacoesTelegram) return;
    const quadro = orientacaoTelegramRef.current;
    if (!quadro) return;
    const animationFrame = window.requestAnimationFrame(() => {
      const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      quadro.scrollIntoView({ behavior: reduzirMovimento ? "instant" : "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(animationFrame);
  }, [mostrarOrientacoesTelegram, pagina]);


  useEffect(() => {
    // Reencontra o comando de inscrição ao voltar do Telegram sem confirmação.
    try {
      const salvo = window.sessionStorage.getItem("fdp.inscricaoTelegramPendente.v1");
      if (salvo) {
        const dados = JSON.parse(salvo) as { comando?: unknown; expiraEm?: unknown };
        if (
          typeof dados.comando === "string" &&
          /^\/start s_[A-Za-z0-9_-]{32}$/.test(dados.comando) &&
          typeof dados.expiraEm === "number" &&
          dados.expiraEm > Date.now()
        ) {
          setComandoInscricaoPendente(dados.comando);
        } else {
          window.sessionStorage.removeItem("fdp.inscricaoTelegramPendente.v1");
        }
      }
    } catch {
      // A navegação normal segue disponível mesmo se o armazenamento falhar.
    }
    const agente = window.navigator.userAgent;
    // iPadOS pode se identificar como Macintosh no navegador.
    const dispositivoIOS = /iphone|ipad|ipod/i.test(agente)
      || (/macintosh/i.test(agente) && window.navigator.maxTouchPoints > 1);
    setPlataformaTelegram(/android/i.test(agente)
      ? "android"
      : dispositivoIOS
        ? "ios"
        : /cros/i.test(agente)
          ? "chromeos"
          : /windows/i.test(agente)
            ? "windows"
            : /macintosh|mac os x/i.test(agente)
              ? "macos"
              : /linux|x11/i.test(agente)
                ? "linux"
                : "outro");
    const simulando = new URLSearchParams(window.location.search).get("simular") === "telegram";
    setSimulacao(simulando);
    let ativo = true;
    async function verificar() {
      try {
        // A consulta de inscrição não pode bloquear a entrada de visitantes no 4G.
        const resposta = await fetch("/api/telegram/sessao", {
          cache: "no-store",
          credentials: "same-origin",
          signal: AbortSignal.timeout(5000),
        });
        if (!resposta.ok) throw new Error("Sessão indisponível");
        const dados = (await resposta.json()) as Situacao;
        if (!ativo) return;
        setSituacao(dados.ativo === true ? "inscrito" : "visitante");
        setIds(
          simulando ? [] : dados.ativo && Array.isArray(dados.ids)
            ? dados.ids.filter((id): id is string =>
                typeof id === "string" && /^[0-9]{8,20}$/.test(id))
            : [],
        );
        setPessoas(
          simulando ? [] : dados.ativo && Array.isArray(dados.pessoas)
            ? dados.pessoas.filter((p): p is PessoaAcompanhada =>
                typeof p.id === "string" && typeof p.nomeUrna === "string")
            : [],
        );
      } catch {
        if (ativo) {
          setSituacao("visitante");
          setIds([]);
          setPessoas([]);
        }
      }
    }
    void verificar();
    window.addEventListener("focus", verificar);
    const aoRetomar = () => {
      if (document.visibilityState === "visible") void verificar();
    };
    document.addEventListener("visibilitychange", aoRetomar);
    return () => {
      ativo = false;
      window.removeEventListener("focus", verificar);
      document.removeEventListener("visibilitychange", aoRetomar);
    };
  }, []);

  useEffect(() => {
    function atualizarNovidades() {
      try {
        setNovidades({
          edicoes: Boolean(versaoEdicoes &&
            window.localStorage.getItem(chaveNovidade("edicoes")) !== versaoEdicoes),
          entregas: Boolean(versaoEntregas &&
            window.localStorage.getItem(chaveNovidade("entregas")) !== versaoEntregas),
        });
      } catch {
        setNovidades({ edicoes: false, entregas: false });
      }
    }
    atualizarNovidades();
    window.addEventListener("pageshow", atualizarNovidades);
    window.addEventListener("focus", atualizarNovidades);
    return () => {
      window.removeEventListener("pageshow", atualizarNovidades);
      window.removeEventListener("focus", atualizarNovidades);
    };
  }, [versaoEdicoes, versaoEntregas]);

  const inscrito = simulacao ? simuladoInscrito : situacao === "inscrito";
  const conferindo = situacao === "verificando" && !simulacao;

  // Aberturas pelo ícone, QR Code ou endereço inicial devem permanecer
  // na apresentação. A navegação até as escolhas é sempre voluntária.


  async function iniciarInscricao() {
    if (abrindoTelegram) return;
    if (simulacao) {
      setSimuladoInscrito(true);
      return;
    }
    setAbrindoTelegram(true);
    setErroTelegram("");
    try {
      const resposta = await fetch("/api/telegram/sessao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [] }),
      });
      if (!resposta.ok) throw new Error("Falha ao iniciar inscrição");
      const dados = await resposta.json() as { url?: string };
      const destino = new URL(dados.url ?? "");
      if (destino.origin !== "https://t.me" ||
          destino.pathname !== "/ForaDaPautaAcompanhaBot" ||
          !/^\?start=s_[A-Za-z0-9_-]{32}$/.test(destino.search)) {
        throw new Error("Endereço do Telegram inválido");
      }
      // Se o Telegram abrir uma conversa antiga sem INICIAR,
      // a pessoa pode copiar e enviar o comando que confirma esta sessão.
      const inicio = destino.searchParams.get("start");
      if (!inicio || !/^s_[A-Za-z0-9_-]{32}$/.test(inicio)) {
        throw new Error("Código de inscrição inválido");
      }
      const comando = `/start ${inicio}`;
      setComandoInscricaoPendente(comando);
      setComandoInscricaoCopiado(false);
      setErroCopiaComando(false);
      try {
        window.sessionStorage.setItem(
          "fdp.inscricaoTelegramPendente.v1",
          JSON.stringify({ comando, expiraEm: Date.now() + 14 * 60 * 1000 }),
        );
      } catch {
        // Não impede o encaminhamento convencional.
      }
      window.location.assign(destino.toString());
    } catch {
      setErroTelegram("Não foi possível abrir o Telegram. Tente novamente.");
      setAbrindoTelegram(false);
    }
  }

  async function copiarComandoInscricao() {
    if (!comandoInscricaoPendente) return;
    try {
      await navigator.clipboard.writeText(comandoInscricaoPendente);
      setComandoInscricaoCopiado(true);
      setErroCopiaComando(false);
    } catch {
      setErroCopiaComando(true);
      setComandoInscricaoCopiado(false);
    }
  }

  async function selecionar(pessoa: { id: string; nomeUrna: string }) {
    if (!inscrito) {
      setAvisoInscricaoAberto(true);
      return;
    }
    if (salvandoEscolha || ids.includes(pessoa.id)) return;
    setErroEscolha("");
    setSalvandoEscolha(true);
    try {
      if (!simulacao) {
        const resposta = await fetch("/api/telegram/sessao", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: [pessoa.id] }),
        });
        if (!resposta.ok) throw new Error("Não foi possível salvar a escolha");
      }
      setIds((anteriores) => anteriores.includes(pessoa.id) ? anteriores : [...anteriores, pessoa.id]);
      setPessoas((anteriores) => anteriores.some((p) => p.id === pessoa.id) ? anteriores : [...anteriores, pessoa]);
      setConfirmadoAgora(null);
    } catch {
      setErroEscolha("Não foi possível salvar sua escolha no Telegram. Tente novamente.");
    } finally {
      setSalvandoEscolha(false);
    }
  }

  return (
    <>
      {pagina === "inicio" ? <section className={styles.apresentacao} id="conteudo" aria-labelledby="mensagem-principal">

        <header className={styles.cabecalho}>
          <div className={styles.marcaEuVigio}>
            <LogoForaDaPauta className={styles.logoOficial} />
            <p className={styles.fraseProjeto}>Conhecer é importante. Entender é fundamental.</p>
          </div>
        </header>
        <div className={styles.intro} id="apresentacao">
          <div className={styles.heroGrid}>
            <div className={styles.heroTexto}>
              <h1 id="mensagem-principal" className={styles.perguntaEditorial}>
                Você confia nas informações que chegam até você?
              </h1>
              <p className={styles.explicacao}>
                O que querem que você pense, sinta ou faça?
              </p>
              <p className={styles.conviteEditorial}>
                Acompanhe o Fora da Pauta.
              </p>
              <p className={styles.descricaoConvite}>
                Receba nossas publicações pelo WhatsApp.
              </p>
              <a
                href="https://whatsapp.com/channel/0029VbDnV1V8aKvH9yaMRY13"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.botaoInscricao}
              >
                Acompanhar
              </a>
              <p className={styles.fraseGratuidade}>É gratuito.</p>
              <nav className={styles.navegacaoHome} aria-label="Outras opções">
                <Link href="/central" className={styles.linkSegundaPagina}>Ir para o menu</Link>
                <InstalarAplicativo tema="escuro" />
              </nav>
            </div>

            <div className={styles.qrArea}>
              <div className={styles.qrCartao}>
                <Image
                  src="/qr/fora-da-pauta.svg"
                  alt="QR Code para abrir o Fora da Pauta no celular"
                  width={224}
                  height={224}
                  className={styles.qrImagem}
                />
              </div>
              <p className={styles.qrInstrucao}>Aponte a câmera do celular para abrir o Fora da Pauta.</p>
            </div>
          </div>
        </div>

      </section> : null}

      {pagina === "opcoes" ? <section
        id="opcoes"
        className={styles.areaBranca}
        ref={areaAcompanhamento}
        aria-labelledby="titulo-opcoes"
      >
        <div className={styles.areaInterna}>
          <h1 id="titulo-opcoes" className="sr-only">Escolher político</h1>
          {conferindo ? (
            <p className={styles.textoArea} role="status">Conferindo sua inscrição...</p>
          ) : (
            <>
              {erroEscolha ? <p role="alert" className="mt-4 text-sm text-red-700">{erroEscolha}</p> : null}
              {salvandoEscolha ? <p role="status" className="mt-4 text-sm">Salvando sua escolha...</p> : null}
              {confirmadoAgora ? (
                <div className="space-y-4" role="status" aria-live="polite">
                  <div className="flex items-center gap-3 rounded-2xl border border-green-600/30 bg-white p-4 shadow-sm">
                    <CandidatePhoto id={confirmadoAgora.id} name={confirmadoAgora.nomeUrna} />
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-lg font-bold">{confirmadoAgora.nomeUrna}</p>
                      <p className="mt-2 text-sm font-semibold text-green-700">✓ Agora você acompanha este político.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setConfirmadoAgora(null)} className="min-h-12 w-full rounded-xl bg-[#FFC400] px-4 py-3 font-bold text-black">
                    Escolher outro político
                  </button>
                </div>
              ) : (
                <CandidateSelector
                  mode="follow"
                  selectedIds={ids}
                  onSelect={selecionar}
                />
              )}
            </>
          )}

          <div className="mt-8 flex justify-center">
            <Link href="/central" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-red-600 px-7 py-3 text-center font-semibold text-white hover:bg-red-700">
              <span aria-hidden="true" className="mr-2">×</span> Fechar
            </Link>
          </div>
        </div>
      </section> : null}
      {pagina === "opcoes" ? (
        <InscricaoNecessariaModal
          aberta={avisoInscricaoAberto}
          onFechar={() => setAvisoInscricaoAberto(false)}
          contexto="politico"
        />
      ) : null}
    </>
  );
}
