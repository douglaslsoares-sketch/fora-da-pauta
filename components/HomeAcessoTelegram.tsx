"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  { titulo: "Escolher políticos", descricao: "Escolha quem acompanhar.", href: "/escolher-quem-acompanhar" },
  { titulo: "Instalar Fora da Pauta", descricao: "Instale no celular.", href: "/instalar" },
  { titulo: "Compartilhar Fora da Pauta", descricao: "Compartilhe o projeto.", href: "/compartilhar" },
];

const mensagemWhatsApp = encodeURIComponent(
  "Conheça o Fora da Pauta. Acompanhe o que seu representante faz depois de eleito. https://www.foradapauta.org/",
);
const linkWhatsApp = "https://wa.me/?text=" + mensagemWhatsApp;

export function HomeAcessoTelegram({ versaoEdicoes, versaoEntregas }: { versaoEdicoes: string | null; versaoEntregas: string | null }) {
  const [situacao, setSituacao] = useState<"verificando" | "inscrito" | "visitante">("verificando");
  const [ids, setIds] = useState<string[]>([]);
  const [pessoas, setPessoas] = useState<PessoaAcompanhada[]>([]);
  const [simulacao, setSimulacao] = useState(false);
  const [simuladoInscrito, setSimuladoInscrito] = useState(false);
  const [abrindoTelegram, setAbrindoTelegram] = useState(false);
  const [erroTelegram, setErroTelegram] = useState("");
  const [avisoJaInscrito, setAvisoJaInscrito] = useState(false);
  const [periodicidade, setPeriodicidade] = useState<"diaria" | "semanal" | "quinzenal">("semanal");

  const [salvandoEscolha, setSalvandoEscolha] = useState(false);
  const [erroEscolha, setErroEscolha] = useState("");
  const [avisoEscolha, setAvisoEscolha] = useState("");
  const [busca, setBusca] = useState(0);
  const [novidades, setNovidades] = useState({ edicoes: false, entregas: false });
  const ancorouInscrito = useRef(false);
  const areaAcompanhamento = useRef<HTMLElement>(null);

  useEffect(() => {
    const simulando = new URLSearchParams(window.location.search).get("simular") === "telegram";
    setSimulacao(simulando);
    try {
      const salva = window.localStorage.getItem("fdp-periodicidade-previa");
      if (salva === "diaria" || salva === "semanal" || salva === "quinzenal") setPeriodicidade(salva);
    } catch { /* Armazenamento indisponível. */ }
    let ativo = true;
    async function verificar() {
      try {
        const resposta = await fetch("/api/telegram/sessao", {
          cache: "no-store",
          credentials: "same-origin",
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

  useEffect(() => {
    if (!inscrito || ancorouInscrito.current) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("conhecer") === "1" ||
        url.hash === "#apresentacao" || url.hash === "#conteudo") return;
    ancorouInscrito.current = true;
    const frame = window.requestAnimationFrame(() => {
      areaAcompanhamento.current?.scrollIntoView({
        block: "start",
        behavior: "instant",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [inscrito]);

  async function iniciarInscricao() {
    if (abrindoTelegram) return;
    if (inscrito) {
      setAvisoJaInscrito(true);
      return;
    }
    if (simulacao) {
      if (simuladoInscrito) {
        setAvisoJaInscrito(true);
      } else {
        setSimuladoInscrito(true);
      }
      return;
    }
    setAbrindoTelegram(true);
    setErroTelegram("");
    try {
      const consulta = await fetch("/api/telegram/sessao", { cache: "no-store", credentials: "same-origin" });
      if (consulta.ok) {
        const sessao = await consulta.json() as Situacao;
        if (sessao.ativo === true) {
          setSituacao("inscrito");
          setAvisoJaInscrito(true);
          setAbrindoTelegram(false);
          return;
        }
      }
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
    if (!inscrito) {
      setErroEscolha("Para receber avisos sobre esta pessoa, primeiro confirme sua inscrição pelo bot do Telegram.");
      return;
    }
    if (salvandoEscolha || ids.includes(pessoa.id)) return;
    setErroEscolha("");
    setAvisoEscolha("");
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
      setIds((anteriores) => anteriores.includes(pessoa.id)
        ? anteriores : [...anteriores, pessoa.id]);
      setPessoas((anteriores) => anteriores.some((p) => p.id === pessoa.id)
        ? anteriores : [...anteriores, pessoa]);
      setAvisoEscolha(simulacao
        ? "Simulação: " + pessoa.nomeUrna + " foi escolhido."
        : "Pronto! Você já acompanha " + pessoa.nomeUrna + ".");
      setBusca((anterior) => anterior + 1);
    } catch {
      setErroEscolha("Não foi possível salvar sua escolha no Telegram. Tente novamente.");
    } finally {
      setSalvandoEscolha(false);
    }
  }

  return (
    <>
      {avisoJaInscrito ? (
        <div className={styles.fundoModalInscricao} role="presentation">
          <div className={styles.modalInscricao} role="dialog" aria-modal="true" aria-labelledby="titulo-ja-inscrito">
            <p id="titulo-ja-inscrito">Você já está inscrito.</p>
            <button type="button" className={styles.fecharModalInscricao} onClick={() => setAvisoJaInscrito(false)}>
              Fechar
            </button>
          </div>
        </div>
      ) : null}
      <section className={styles.apresentacao} id="conteudo" aria-labelledby="mensagem-principal">
        <div className={styles.olhoFundo} aria-hidden="true" />
        <header className={styles.cabecalho}>
          <Image
            src="/marca/fora-da-pauta-horizontal-branco.svg"
            alt="Fora da Pauta"
            width={2325}
            height={374}
            priority
            className={styles.logo}
          />
          <p className={styles.subtitulo}>Decisões que afetam a sua vida.</p>
        </header>
        <div className={styles.intro} id="apresentacao">
          <div className={styles.heroGrid}>
            <div className={styles.heroTexto}>
              <h1 id="mensagem-principal" className={styles.chamada}>
                Acompanhe o dia a dia dos políticos.
              </h1>
              <p className={styles.explicacao}>
                Todos os dias, o Fora da Pauta acompanha as notícias, consulta os registros
                oficiais da Câmara, do Senado e dos governos e observa o que os políticos
                publicam nas redes sociais.
              </p>
              <p className={styles.explicacao}>
                Depois, reúne e organiza essas informações para você entender o que eles
                dizem, o que fazem e como suas decisões afetam a sua vida.
              </p>
              <p className={styles.explicacao}>
                Para ficar sabendo das novidades, inscreva-se gratuitamente
                no canal do Fora da Pauta no Telegram.
              </p>
              <p className={styles.explicacao}>Você será avisado por lá.</p>

              <button
                type="button"
                onClick={() => void iniciarInscricao()}
                disabled={conferindo || abrindoTelegram}
                className={styles.botaoInscricao}
              >
                {abrindoTelegram ? "Abrindo Telegram..." : "Inscrever no Telegram"}
                <span aria-hidden="true"> →</span>

              </button>
              {erroTelegram ? <p role="alert" className={styles.aviso}>{erroTelegram}</p> : null}
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
      </section>

      <section id="opcoes" className={styles.areaBranca} ref={areaAcompanhamento} aria-labelledby="titulo-opcoes">
        <div className={styles.areaInterna}>
          <h2 className={styles.tituloMenu} id="titulo-opcoes">HÁ MAIS PARA ENTENDER.</h2>
          <nav aria-label="Opções do Fora da Pauta" className={styles.listaBotoes}>
            {opcoes.filter((opcao) => !opcao.exigeEscolhas || (inscrito && ids.length > 0)).map((opcao) => (
              <Link key={opcao.titulo} href={opcao.href} className={`${styles.botaoOpcao} ${opcao.titulo === "Compartilhar Fora da Pauta" ? styles.botaoWhatsApp : ""}`}>
                <strong className={styles.rotuloOpcao}>
                  <span>{opcao.titulo} {opcao.titulo === "Instalar Fora da Pauta" ? "↓" : "→"}</span>
                  {opcao.novidade && novidades[opcao.novidade] ? (
                    <span className={styles.marcaNovidade}>Novidade</span>
                  ) : null}
                </strong>
              </Link>
            ))}
          </nav>

        </div>
      </section>
    </>
  );
}
