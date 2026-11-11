"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CandidateSelector } from "@/components/CandidateSelector";
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

const mensagemWhatsApp = encodeURIComponent(
  "Conheça o Fora da Pauta. Acompanhe o que seu representante faz depois de eleito. https://www.foradapauta.org/",
);
const linkWhatsApp = "https://wa.me/?text=" + mensagemWhatsApp;

export function HomeAcessoTelegram({ versaoEdicoes, versaoEntregas, pagina = "inicio" }: { versaoEdicoes: string | null; versaoEntregas: string | null; pagina?: "inicio" | "opcoes" }) {
  const [situacao, setSituacao] = useState<"verificando" | "inscrito" | "visitante">("verificando");
  const [ids, setIds] = useState<string[]>([]);
  const [pessoas, setPessoas] = useState<PessoaAcompanhada[]>([]);
  const [simulacao, setSimulacao] = useState(false);
  const [simuladoInscrito, setSimuladoInscrito] = useState(false);
  const [abrindoTelegram, setAbrindoTelegram] = useState(false);
  const [mostrarOrientacoesTelegram, setMostrarOrientacoesTelegram] = useState(false);
  const [precisaInstalarTelegram, setPrecisaInstalarTelegram] = useState(false);
  const [erroTelegram, setErroTelegram] = useState("");
  const [salvandoEscolha, setSalvandoEscolha] = useState(false);
  const [erroEscolha, setErroEscolha] = useState("");
  const [confirmadoAgora, setConfirmadoAgora] = useState<PessoaAcompanhada | null>(null);
  const [busca, setBusca] = useState(0);
  const [novidades, setNovidades] = useState({ edicoes: false, entregas: false });
  const areaAcompanhamento = useRef<HTMLElement>(null);

  useEffect(() => {
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
      window.location.assign(destino.toString());
    } catch {
      setErroTelegram("Não foi possível abrir o Telegram. Tente novamente.");
      setAbrindoTelegram(false);
    }
  }

  async function selecionar(pessoa: { id: string; nomeUrna: string }) {
    if (!inscrito || salvandoEscolha) return;
    setErroEscolha("");
    setSalvandoEscolha(true);
    if (ids.includes(pessoa.id)) return;
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
      setConfirmadoAgora(pessoa);
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
            <div className={styles.recorteOlhoReal}><Image src="/marca/eu-vigio-original.svg" alt="Olho realista dourado do Fora da Pauta" width={660} height={440} priority unoptimized className={styles.logoOriginalEuVigio} /></div>
            <h2 className={styles.nomeProjeto}>FORA DA PAUTA</h2>
            <p className={styles.fraseProjeto}>Decisões que afetam a sua vida.</p>
          </div>
        </header>
        <div className={styles.intro} id="apresentacao">
          <div className={styles.heroGrid}>
            <div className={styles.heroTexto}>
              <h1 id="mensagem-principal" className={styles.chamada}>
                Existe muito mais por trás das notícias.
              </h1>
              <p className={styles.explicacao}>
                O Fora da Pauta mostra o que nem sempre é contado, investiga os interesses por trás dos acontecimentos e ajuda você a entender como as decisões políticas afetam a sua vida.
              </p>
              <p className={styles.explicacao}>Acompanhe os políticos, saiba o que fazem e entenda o que está em jogo.</p>
              <button type="button" onClick={() => setMostrarOrientacoesTelegram((anterior) => !anterior)} className={styles.botaoInscricao} aria-expanded={mostrarOrientacoesTelegram} aria-controls="orientacao-telegram">
                Quero receber as notícias
              </button>
              <p className={styles.fraseGratuidade}>É gratuito. Receba nossas notícias pelo Telegram.</p>
              {mostrarOrientacoesTelegram ? (
                <div id="orientacao-telegram" className={styles.quadroTelegram}>
                  <h2 className={styles.perguntaTelegram}>Você já tem Telegram instalado no celular?</h2>
                  <button type="button" onClick={() => void iniciarInscricao()} disabled={conferindo || inscrito || abrindoTelegram} className={styles.opcaoTelegram}>
                    {abrindoTelegram ? "Abrindo Telegram..." : "Sim, já tenho Telegram"}
                  </button>
                  <button type="button" onClick={() => setPrecisaInstalarTelegram((anterior) => !anterior)} className={styles.opcaoTelegramSecundaria} aria-expanded={precisaInstalarTelegram}>
                    Não, preciso instalar
                  </button>
                  {precisaInstalarTelegram ? (
                    <div className={styles.instrucoesTelegram}>
                      <p>1. Toque em Instalar o Telegram.</p>
                      <p>2. Na tela que vai abrir, toque em Instalar e espere terminar.</p>
                      <p>3. Depois volte aqui e toque em Continuar inscrição.</p>
                      <a href="https://telegram.org/apps" target="_blank" rel="noopener noreferrer" className={styles.opcaoTelegram}>Instalar o Telegram</a>
                      <button type="button" onClick={() => void iniciarInscricao()} disabled={conferindo || inscrito || abrindoTelegram} className={styles.opcaoTelegramSecundaria}>
                        {abrindoTelegram ? "Abrindo Telegram..." : "Continuar inscrição"}
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {erroTelegram ? <p role="alert" className={styles.aviso}>{erroTelegram}</p> : null}
              <p className={styles.dominioProjeto}>foradapauta.org</p>
              <Link href="/central" className={styles.linkSegundaPagina}>Ir para o menu</Link>
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
          {conferindo ? (
            <p className={styles.textoArea} role="status">Conferindo sua inscrição...</p>
          ) : inscrito ? (
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
          ) : (
            <>
              <p className={styles.textoArea}>
                Para escolher quem você quer acompanhar, faça primeiro sua inscrição gratuita no Telegram.
              </p>
              <Link href="/" className={styles.botaoOpcao}>
                <strong>Ir para a inscrição ↑</strong>
              </Link>
            </>
          )}

          <div className="mt-8 flex justify-center">
            <Link href="/central" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-red-600 px-7 py-3 text-center font-semibold text-white hover:bg-red-700">
              <span aria-hidden="true" className="mr-2">×</span> Fechar
            </Link>
          </div>
        </div>
      </section> : null}
    </>
  );
}
