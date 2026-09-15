"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { MarkdownDocument } from "@/components/MarkdownDocument";

type AudioStartDetail = {
  rootSelector?: string;
  title?: string;
  startIndex?: number;
};

const SELECTOR_DE_LEITURA =
  "h1,h2,h3,h4,p,li,blockquote,dt,dd";

const VELOCIDADES = [0.85, 1, 1.15, 1.3];

function limparTexto(texto: string) {
  return texto.replace(/\s+/g, " ").trim();
}

function obterBlocos(root: Element) {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      SELECTOR_DE_LEITURA,
    ),
  ).filter((elemento) => {
    if (
      elemento.closest(
        [
          "[data-editorial-ignore]",
          "footer",
          "nav",
          "form",
          "button",
          "select",
          "input",
          "textarea",
          "[aria-hidden='true']",
        ].join(","),
      )
    ) {
      return false;
    }

    const texto = limparTexto(
      elemento.innerText ||
        elemento.textContent ||
        "",
    );

    if (texto.length < 2) {
      return false;
    }

    return true;
  });
}

const PAUSA_ENTRE_TRECHOS_MS = 180;
const LIMITE_TRECHO_AUDIO = 3400;

type TipoBlocoLeitura =
  | "titulo"
  | "subtitulo"
  | "paragrafo"
  | "item";

type TrechoLeitura = {
  elementos: HTMLElement[];
  texto: string;
  estrutura: TipoBlocoLeitura[];
};

export function EditorialAudioSystem() {
  const pathname = usePathname();

  const [modalAberto, setModalAberto] =
    useState(false);

  const [modoEditorial, setModoEditorial] =
    useState<"resumo" | "completo">("resumo");

  const [markdown, setMarkdown] =
    useState("");

  const [carregandoMarkdown, setCarregandoMarkdown] =
    useState(false);

  const [erroMarkdown, setErroMarkdown] =
    useState("");

  const [ativo, setAtivo] =
    useState(false);

  const [pausado, setPausado] =
    useState(false);

  const [indice, setIndice] =
    useState(0);

  const [total, setTotal] =
    useState(0);

  const [titulo, setTitulo] =
    useState("Fora da Pauta");

  const [velocidade, setVelocidade] =
    useState(1);

  const [erroAudio, setErroAudio] =
    useState("");

  const blocosRef =
    useRef<HTMLElement[]>([]);

  const indiceRef =
    useRef(0);

  const velocidadeRef =
    useRef(1);

  const sequenciaRef =
    useRef(0);

  const ativoRef =
    useRef(false);

  const pausadoRef =
    useRef(false);

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const audioUrlRef =
    useRef<string | null>(null);

  const requisicaoAudioRef =
    useRef<AbortController | null>(null);

  const transicaoAudioRef =
    useRef<number | null>(null);

  const cacheAudioRef =
    useRef<Map<string, Blob>>(new Map());

  const audioEmPreparacaoRef =
    useRef<Map<string, Promise<Blob>>>(
      new Map(),
    );

  const trechosRef =
    useRef<TrechoLeitura[]>([]);

  const seletorAtualRef =
    useRef("");

  const elementosDestacadosRef =
    useRef<HTMLElement[]>([]);

  function removerDestaque() {
    for (
      const elemento of
      elementosDestacadosRef.current
    ) {
      elemento.classList.remove(
        "fdp-audio-active",
      );
    }

    elementosDestacadosRef.current = [];
  }

  function destacar(
    elementos: HTMLElement[],
  ) {
    removerDestaque();

    if (!elementos.length) {
      return;
    }

    for (const elemento of elementos) {
      elemento.classList.add(
        "fdp-audio-active",
      );
    }

    elementosDestacadosRef.current =
      elementos;

    const primeiro =
      elementos[0];

    const rect =
      primeiro.getBoundingClientRect();

    const foraDaTela =
      rect.top < 90 ||
      rect.bottom >
        window.innerHeight - 150;

    if (foraDaTela) {
      primeiro.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }
  function limparAudioAtual() {
    if (transicaoAudioRef.current !== null) {
      window.clearTimeout(
        transicaoAudioRef.current,
      );

      transicaoAudioRef.current = null;
    }

    requisicaoAudioRef.current?.abort();
    requisicaoAudioRef.current = null;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.src = "";
      audioRef.current = null;
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(
        audioUrlRef.current,
      );

      audioUrlRef.current = null;
    }
  }

  function encerrarLeitura() {
    sequenciaRef.current += 1;

    limparAudioAtual();
    removerDestaque();

    ativoRef.current = false;
    pausadoRef.current = false;

    setAtivo(false);
    setPausado(false);
  }

  function numeroDeListaOrdenada(
    elemento: HTMLElement,
  ): string | null {
    if (
      elemento.tagName !== "LI" ||
      elemento.parentElement?.tagName !== "OL"
    ) {
      return null;
    }

    const lista =
      elemento.parentElement as HTMLOListElement;

    const itens =
      Array.from(
        lista.children,
      ).filter(
        (
          filho,
        ): filho is HTMLLIElement =>
          filho.tagName === "LI",
      );

    const indice =
      itens.indexOf(
        elemento as HTMLLIElement,
      );

    if (indice < 0) {
      return null;
    }

    const inicioInformado =
      lista.getAttribute("start");

    let numero =
      inicioInformado !== null
        ? Number.parseInt(
            inicioInformado,
            10,
          )
        : lista.reversed
          ? itens.length
          : 1;

    if (!Number.isFinite(numero)) {
      numero =
        lista.reversed
          ? itens.length
          : 1;
    }

    for (
      let i = 0;
      i <= indice;
      i += 1
    ) {
      const item =
        itens[i];

      const valorExplicito =
        item.getAttribute(
          "value",
        );

      if (valorExplicito !== null) {
        const valor =
          Number.parseInt(
            valorExplicito,
            10,
          );

        if (Number.isFinite(valor)) {
          numero = valor;
        }
      }

      if (i === indice) {
        break;
      }

      numero +=
        lista.reversed
          ? -1
          : 1;
    }

    return String(numero);
  }

  function numeroVisualDoTitulo(
    elemento: HTMLElement,
  ): string | null {
    if (
      !/^H[1-6]$/.test(
        elemento.tagName,
      )
    ) {
      return null;
    }

    /*
     * Caso comum no Fora da Pauta:
     *
     * [ círculo com "2" ]
     * [ título "Princípios fundamentais" ]
     *
     * O número aparece na tela, mas pode estar
     * fora do H2/H3 e por isso não entrava
     * no texto enviado ao áudio.
     */
    const anterior =
      elemento.previousElementSibling;

    if (anterior instanceof HTMLElement) {
      const textoAnterior =
        limparTexto(
          anterior.innerText ||
            anterior.textContent ||
            "",
        );

      const numero =
        textoAnterior.match(
          /^(\d{1,3})[.)]?$/,
        );

      if (numero) {
        return numero[1];
      }
    }

    /*
     * Também procura um pequeno marcador
     * numérico dentro do mesmo bloco pai,
     * imediatamente antes do título.
     */
    const pai =
      elemento.parentElement;

    if (!pai) {
      return null;
    }

    const filhos =
      Array.from(
        pai.children,
      );

    const indice =
      filhos.indexOf(
        elemento,
      );

    if (indice <= 0) {
      return null;
    }

    const candidato =
      filhos[
        indice - 1
      ];

    if (
      candidato instanceof HTMLElement
    ) {
      const textoCandidato =
        limparTexto(
          candidato.innerText ||
            candidato.textContent ||
            "",
        );

      const numero =
        textoCandidato.match(
          /^(\d{1,3})[.)]?$/,
        );

      if (numero) {
        return numero[1];
      }
    }

    return null;
  }

  function textoDoElemento(
    elemento: HTMLElement,
  ) {
    const texto =
      limparTexto(
        elemento.innerText ||
          elemento.textContent ||
          "",
      );

    if (!texto) {
      return "";
    }

    const numeroLista =
      numeroDeListaOrdenada(
        elemento,
      );

    const numeroVisual =
      numeroLista ??
      numeroVisualDoTitulo(
        elemento,
      );

    if (!numeroVisual) {
      return texto;
    }

    /*
     * Não duplica quando o próprio texto
     * já começa com "2", "2." ou "2)".
     */
    const jaPossuiNumero =
      new RegExp(
        `^${numeroVisual}\\s*[.)]?\\s+`,
      ).test(texto);

    if (jaPossuiNumero) {
      return texto;
    }

    return `${numeroVisual}. ${texto}`;
  }
  function tipoDoElemento(
    elemento: HTMLElement,
  ): TipoBlocoLeitura {
    if (elemento.tagName === "H1") {
      return "titulo";
    }

    if (
      /^H[2-6]$/.test(
        elemento.tagName,
      )
    ) {
      return "subtitulo";
    }

    if (elemento.tagName === "LI") {
      return "item";
    }

    return "paragrafo";
  }

  function quebrarTextoLongo(
    texto: string,
    limite: number,
  ) {
    const partes: string[] = [];

    let restante =
      texto.trim();

    while (restante.length > limite) {
      let corte =
        restante.lastIndexOf(
          ". ",
          limite,
        );

      if (corte < limite * 0.55) {
        corte =
          restante.lastIndexOf(
            " ",
            limite,
          );
      }

      if (corte <= 0) {
        corte = limite;
      } else if (
        restante[corte] === "."
      ) {
        corte += 1;
      }

      partes.push(
        restante
          .slice(0, corte)
          .trim(),
      );

      restante =
        restante
          .slice(corte)
          .trim();
    }

    if (restante) {
      partes.push(restante);
    }

    return partes;
  }

  function separadorEditorial(
    tipoAnterior: TipoBlocoLeitura,
    tipoAtual: TipoBlocoLeitura,
  ) {
    /*
     * Regra principal:
     *
     * Título principal -> tópico numerado
     * e
     * tópico numerado -> primeiro parágrafo
     *
     * recebem o MESMO espaço editorial.
     *
     * Tudo continua dentro da mesma geração
     * de áudio para preservar a mesma voz.
     */
    if (
      tipoAnterior === "titulo" &&
      tipoAtual === "subtitulo"
    ) {
      return "\n\n\n\n\n\n";
    }

    if (
      tipoAnterior === "subtitulo" &&
      (
        tipoAtual === "paragrafo" ||
        tipoAtual === "item"
      )
    ) {
      return "\n\n\n\n\n";
    }

    /*
     * Saída de lista para texto normal:
     * pequena respiração editorial.
     */
    if (
      tipoAnterior === "item" &&
      tipoAtual === "paragrafo"
    ) {
      return "\n\n\n";
    }

    /*
     * Entrada em lista:
     * pequena respiração editorial.
     */
    if (
      tipoAnterior !== "item" &&
      tipoAtual === "item"
    ) {
      return "\n\n\n";
    }

    /*
     * Fluxo normal entre parágrafos
     * ou itens consecutivos.
     */
    return "\n\n";
  }

  function prepararParteParaNarracao(
    parte: string,
    tipo: TipoBlocoLeitura,
  ) {
    const texto =
      parte.trim();

    /*
     * Única exceção:
     *
     * o TÍTULO PRINCIPAL recebe um ponto final
     * somente na cópia enviada à narração.
     *
     * Isso faz a voz encerrar a frase em vez
     * de deixá-la com entonação de continuidade.
     *
     * O ponto NÃO aparece visualmente na página.
     * Subtítulos e demais blocos permanecem intactos.
     */
    if (
      tipo === "titulo" &&
      texto &&
      !/[.!?…]$/.test(texto)
    ) {
      return `${texto}.`;
    }

    /*
     * Correção EXCLUSIVA do tópico 12:
     * "Linguagem".
     *
     * O ponto existe somente na versão
     * enviada à narração e não aparece
     * visualmente na página.
     */
    if (
      tipo === "subtitulo" &&
      texto.toLocaleLowerCase("pt-BR") ===
        "linguagem" &&
      !/[.!?…]$/.test(texto)
    ) {
      return `${texto}.`;
    }

    /*
     * Correção EXCLUSIVA do tópico 17:
     * "O papel do leitor".
     *
     * O ponto existe somente na versão
     * enviada à narração e não aparece
     * visualmente na página.
     */
    if (
      tipo === "subtitulo" &&
      texto.toLocaleLowerCase("pt-BR") ===
        "o papel do leitor" &&
      !/[.!?…]$/.test(texto)
    ) {
      return `${texto}.`;
    }

    /*
     * FDP_CORRECOES_CIRURGICAS_20260911
     *
     * SOMENTE:
     * 13. Temas controversos
     * 15. Uso de inteligência artificial
     * 17. O papel do leitor
     * e os dois parágrafos especificados.
     */

    const textoSemNumeroFdp =
      texto
        .replace(
          /^\s*\d+\s*[.)]?\s*/,
          "",
        )
        .trim();

    const textoSemFechoFdp =
      textoSemNumeroFdp
        .replace(
          /[.!?…]+$/,
          "",
        )
        .trim();

    const chaveFdp =
      textoSemFechoFdp
        .toLocaleLowerCase("pt-BR");

    /*
     * 13. Temas controversos
     * Corrige somente a numeração falada.
     */
    if (
      tipo === "subtitulo" &&
      chaveFdp ===
        "temas controversos"
    ) {
      return `13. ${textoSemNumeroFdp}`;
    }

    /*
     * 15. Uso de inteligência artificial
     * Corrige somente a numeração falada.
     */
    if (
      tipo === "subtitulo" &&
      chaveFdp ===
        "uso de inteligência artificial"
    ) {
      return `15. ${textoSemNumeroFdp}`;
    }

    /*
     * 17. O papel do leitor
     * Corrige somente o fechamento da entonação.
     * Preserva o número que já estiver presente.
     */
    if (
      tipo === "subtitulo" &&
      chaveFdp ===
        "o papel do leitor"
    ) {
      return /[.!?…]$/.test(texto)
        ? texto
        : `${texto}.`;
    }

    const textoParagrafoSemFechoFdp =
      texto
        .replace(
          /[.!?…]+$/,
          "",
        )
        .trim();

    const chaveParagrafoFdp =
      textoParagrafoSemFechoFdp
        .toLocaleLowerCase("pt-BR");

    /*
     * Frase específica 1:
     * apenas sensação de encerramento.
     */
    if (
      tipo === "paragrafo" &&
      chaveParagrafoFdp ===
        "seu papel é oferecer informação suficiente, organizada e contextualizada para que cada pessoa possa formar sua própria avaliação"
    ) {
      return `${textoParagrafoSemFechoFdp}.`;
    }

    /*
     * Frase específica 2:
     * apenas sensação de encerramento.
     */
    if (
      tipo === "paragrafo" &&
      chaveParagrafoFdp ===
        "a ausência de fato novo não significa ausência de verificação"
    ) {
      return `${textoParagrafoSemFechoFdp}.`;
    }
    return texto;
  }
  function montarTextoEstruturado(
    partes: string[],
    estrutura: TipoBlocoLeitura[],
  ) {
    return partes
      .map(
        (
          parte,
          indice,
        ) => {
          const tipoAtual =
            estrutura[indice];

          const partePreparada =
            prepararParteParaNarracao(
              parte,
              tipoAtual,
            );

          if (indice === 0) {
            return partePreparada;
          }

          const tipoAnterior =
            estrutura[
              indice - 1
            ];

          return (
            separadorEditorial(
              tipoAnterior,
              tipoAtual,
            ) +
            partePreparada
          );
        },
      )
      .join("");
  }
  function montarTrechos(
    blocos: HTMLElement[],
  ) {
    const trechos: TrechoLeitura[] = [];

    let elementosAtuais:
      HTMLElement[] = [];

    let partesAtuais:
      string[] = [];

    let estruturaAtual:
      TipoBlocoLeitura[] = [];

    let tamanhoAtual = 0;
    let temCorpo = false;

    function fecharTrecho() {
      if (!partesAtuais.length) {
        return;
      }

      trechos.push({
        elementos:
          [...elementosAtuais],

        texto:
          montarTextoEstruturado(
            partesAtuais,
            estruturaAtual,
          ),

        estrutura:
          [...estruturaAtual],
      });

      elementosAtuais = [];
      partesAtuais = [];
      estruturaAtual = [];
      tamanhoAtual = 0;
      temCorpo = false;
    }

    for (const elemento of blocos) {
      const texto =
        textoDoElemento(elemento);

      if (!texto) {
        continue;
      }

      const tipo =
        tipoDoElemento(elemento);

      const ehTitulo =
        tipo === "titulo" ||
        tipo === "subtitulo";

      /*
       * Um novo título editorial começa
       * uma nova seção somente quando
       * já existe corpo textual anterior.
       *
       * Assim, título principal + subtítulo
       * consecutivo permanecem juntos.
       */
      if (
        ehTitulo &&
        temCorpo &&
        partesAtuais.length
      ) {
        fecharTrecho();
      }

      /*
       * Segurança para elementos muito longos.
       */
      if (
        texto.length >
        LIMITE_TRECHO_AUDIO
      ) {
        fecharTrecho();

        const pedacos =
          quebrarTextoLongo(
            texto,
            LIMITE_TRECHO_AUDIO,
          );

        for (
          const pedaco of pedacos
        ) {
          trechos.push({
            elementos: [elemento],
            texto: pedaco,
            estrutura: [tipo],
          });
        }

        continue;
      }

      const separador =
        partesAtuais.length
          ? 2
          : 0;

      const ultrapassa =
        tamanhoAtual +
          separador +
          texto.length >
        LIMITE_TRECHO_AUDIO;

      if (
        ultrapassa &&
        partesAtuais.length
      ) {
        fecharTrecho();
      }

      elementosAtuais.push(
        elemento,
      );

      partesAtuais.push(
        texto,
      );

      estruturaAtual.push(
        tipo,
      );

      tamanhoAtual =
        montarTextoEstruturado(
          partesAtuais,
          estruturaAtual,
        ).length;

      if (!ehTitulo) {
        temCorpo = true;
      }
    }

    fecharTrecho();

    return trechos;
  }
  /*
   * FDP_PAUSA_FIXA_APOS_TITULO
   *
   * Mantém a gravação original do TTS e apenas
   * prolonga a primeira pausa editorial real.
   *
   * Isso evita voltar a separar título e corpo
   * em duas gerações diferentes.
   */
  function escreverTextoWav(
    view: DataView,
    offset: number,
    texto: string,
  ) {
    for (
      let i = 0;
      i < texto.length;
      i += 1
    ) {
      view.setUint8(
        offset + i,
        texto.charCodeAt(i),
      );
    }
  }

  function criarWavComSilencio(
    buffer: AudioBuffer,
    posicaoInsercao: number,
    quantidadeSilencio: number,
  ) {
    const canais =
      buffer.numberOfChannels;

    const sampleRate =
      buffer.sampleRate;

    const bytesPorAmostra = 2;

    const tamanhoOriginal =
      buffer.length;

    const novoTamanho =
      tamanhoOriginal +
      quantidadeSilencio;

    const alinhamento =
      canais *
      bytesPorAmostra;

    const tamanhoDados =
      novoTamanho *
      alinhamento;

    const arrayBuffer =
      new ArrayBuffer(
        44 + tamanhoDados,
      );

    const view =
      new DataView(
        arrayBuffer,
      );

    escreverTextoWav(
      view,
      0,
      "RIFF",
    );

    view.setUint32(
      4,
      36 + tamanhoDados,
      true,
    );

    escreverTextoWav(
      view,
      8,
      "WAVE",
    );

    escreverTextoWav(
      view,
      12,
      "fmt ",
    );

    view.setUint32(
      16,
      16,
      true,
    );

    view.setUint16(
      20,
      1,
      true,
    );

    view.setUint16(
      22,
      canais,
      true,
    );

    view.setUint32(
      24,
      sampleRate,
      true,
    );

    view.setUint32(
      28,
      sampleRate *
        alinhamento,
      true,
    );

    view.setUint16(
      32,
      alinhamento,
      true,
    );

    view.setUint16(
      34,
      16,
      true,
    );

    escreverTextoWav(
      view,
      36,
      "data",
    );

    view.setUint32(
      40,
      tamanhoDados,
      true,
    );

    const dadosCanais =
      Array.from(
        {
          length: canais,
        },
        (_, canal) =>
          buffer.getChannelData(
            canal,
          ),
      );

    let offset = 44;

    for (
      let quadro = 0;
      quadro < novoTamanho;
      quadro += 1
    ) {
      const dentroDoSilencio =
        quadro >= posicaoInsercao &&
        quadro <
          posicaoInsercao +
            quantidadeSilencio;

      const quadroOriginal =
        quadro < posicaoInsercao
          ? quadro
          : quadro -
            quantidadeSilencio;

      for (
        let canal = 0;
        canal < canais;
        canal += 1
      ) {
        let amostra = 0;

        if (
          !dentroDoSilencio &&
          quadroOriginal >= 0 &&
          quadroOriginal <
            tamanhoOriginal
        ) {
          amostra =
            dadosCanais[
              canal
            ][
              quadroOriginal
            ];
        }

        amostra =
          Math.max(
            -1,
            Math.min(
              1,
              amostra,
            ),
          );

        const valor =
          amostra < 0
            ? amostra * 0x8000
            : amostra * 0x7fff;

        view.setInt16(
          offset,
          valor,
          true,
        );

        offset += 2;
      }
    }

    return new Blob(
      [arrayBuffer],
      {
        type: "audio/wav",
      },
    );
  }

  function encontrarPrimeiraPausaEditorial(
    buffer: AudioBuffer,
    titulo: string,
  ) {
    const sampleRate =
      buffer.sampleRate;

    const canaisAnalisados =
      Math.min(
        buffer.numberOfChannels,
        2,
      );

    if (
      canaisAnalisados < 1 ||
      buffer.duration < 1
    ) {
      return null;
    }

    const palavras =
      titulo
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;

    /*
     * Estimativa usada apenas para restringir
     * a região onde procuramos a pausa.
     *
     * Nunca cortamos o áudio com base apenas
     * nessa estimativa.
     */
    const estimativaTituloMs =
      Math.max(
        600,
        Math.min(
          4200,
          palavras * 340,
        ),
      );

    const inicioBuscaMs =
      Math.max(
        300,
        estimativaTituloMs * 0.45,
      );

    const fimBuscaMs =
      Math.min(
        buffer.duration * 1000,
        Math.max(
          2200,
          estimativaTituloMs * 1.8,
        ),
      );

    const tamanhoJanelaMs = 10;

    const amostrasJanela =
      Math.max(
        1,
        Math.floor(
          sampleRate *
            tamanhoJanelaMs /
            1000,
        ),
      );

    const dados =
      Array.from(
        {
          length:
            canaisAnalisados,
        },
        (_, canal) =>
          buffer.getChannelData(
            canal,
          ),
      );

    const inicioBusca =
      Math.floor(
        inicioBuscaMs *
          sampleRate /
          1000,
      );

    const fimBusca =
      Math.min(
        buffer.length,
        Math.floor(
          fimBuscaMs *
            sampleRate /
            1000,
        ),
      );

    const LIMIAR_SILENCIO =
      0.015;

    type Candidato = {
      inicio: number;
      fim: number;
      duracaoMs: number;
      centroMs: number;
    };

    const candidatos:
      Candidato[] = [];

    let inicioSilencio:
      number | null = null;

    for (
      let inicioJanela =
        inicioBusca;
      inicioJanela <
        fimBusca;
      inicioJanela +=
        amostrasJanela
    ) {
      const fimJanela =
        Math.min(
          fimBusca,
          inicioJanela +
            amostrasJanela,
        );

      let pico = 0;

      /*
       * Pulamos algumas amostras apenas
       * para reduzir o custo da análise.
       */
      for (
        let i =
          inicioJanela;
        i < fimJanela;
        i += 3
      ) {
        for (
          let canal = 0;
          canal <
            canaisAnalisados;
          canal += 1
        ) {
          pico =
            Math.max(
              pico,
              Math.abs(
                dados[
                  canal
                ][i],
              ),
            );
        }
      }

      const silencioso =
        pico <
        LIMIAR_SILENCIO;

      if (silencioso) {
        if (
          inicioSilencio === null
        ) {
          inicioSilencio =
            inicioJanela;
        }

        continue;
      }

      if (
        inicioSilencio !== null
      ) {
        const fimSilencio =
          inicioJanela;

        const duracaoMs =
          (
            fimSilencio -
            inicioSilencio
          ) *
          1000 /
          sampleRate;

        if (
          duracaoMs >= 90
        ) {
          candidatos.push({
            inicio:
              inicioSilencio,

            fim:
              fimSilencio,

            duracaoMs,

            centroMs:
              (
                inicioSilencio +
                fimSilencio
              ) /
              2 *
              1000 /
              sampleRate,
          });
        }

        inicioSilencio = null;
      }
    }

    if (
      inicioSilencio !== null
    ) {
      const duracaoMs =
        (
          fimBusca -
          inicioSilencio
        ) *
        1000 /
        sampleRate;

      if (duracaoMs >= 90) {
        candidatos.push({
          inicio:
            inicioSilencio,

          fim:
            fimBusca,

          duracaoMs,

          centroMs:
            (
              inicioSilencio +
              fimBusca
            ) /
            2 *
            1000 /
            sampleRate,
        });
      }
    }

    if (!candidatos.length) {
      return null;
    }

    /*
     * Escolhe a pausa real mais próxima do ponto
     * em que o título provavelmente termina.
     *
     * Uma pausa mais longa recebe pequena vantagem.
     */
    candidatos.sort(
      (a, b) => {
        const scoreA =
          Math.abs(
            a.centroMs -
              estimativaTituloMs,
          ) -
          a.duracaoMs *
            0.35;

        const scoreB =
          Math.abs(
            b.centroMs -
              estimativaTituloMs,
          ) -
          b.duracaoMs *
            0.35;

        return scoreA - scoreB;
      },
    );

    return candidatos[0];
  }

  async function ajustarPausaAposTitulo(
    blob: Blob,
    texto: string,
    estrutura: TipoBlocoLeitura[],
  ) {
    /*
     * Só fazemos o tratamento quando o trecho
     * realmente começa com:
     *
     * título -> subtítulo/tópico
     */
    if (
      estrutura.length < 2 ||
      estrutura[0] !== "titulo" ||
      estrutura[1] !== "subtitulo"
    ) {
      return blob;
    }

    try {
      const contexto =
        new AudioContext();

      try {
        const dados =
          await blob.arrayBuffer();

        const buffer =
          await contexto.decodeAudioData(
            dados.slice(0),
          );

        /*
         * O título é a parte anterior ao grande
         * separador editorial já existente.
         */
        const titulo =
          texto
            .split(/\n{3,}/)[0]
            ?.trim() ||
          "";

        if (!titulo) {
          return blob;
        }

        const pausa =
          encontrarPrimeiraPausaEditorial(
            buffer,
            titulo,
          );

        if (!pausa) {
          return blob;
        }

        const PAUSA_ALVO_MS =
          600;

        /*
         * Se a própria narração já entregou
         * aproximadamente a pausa desejada,
         * não tocamos nela.
         */
        if (
          pausa.duracaoMs >=
          PAUSA_ALVO_MS - 40
        ) {
          return blob;
        }

        const silencioExtraMs =
          PAUSA_ALVO_MS -
          pausa.duracaoMs;

        /*
         * Proteção adicional:
         * nunca acrescentamos mais de 500 ms.
         */
        const silencioSeguroMs =
          Math.min(
            500,
            Math.max(
              0,
              silencioExtraMs,
            ),
          );

        if (
          silencioSeguroMs <
          40
        ) {
          return blob;
        }

        const silencioAmostras =
          Math.floor(
            buffer.sampleRate *
              silencioSeguroMs /
              1000,
          );

        /*
         * Inserimos no meio da pausa real,
         * nunca dentro da fala.
         */
        const posicao =
          Math.floor(
            (
              pausa.inicio +
              pausa.fim
            ) /
            2,
          );

        return criarWavComSilencio(
          buffer,
          posicao,
          silencioAmostras,
        );
      } finally {
        await contexto.close();
      }
    } catch (error) {
      /*
       * Segurança:
       * se o navegador não conseguir analisar
       * o áudio, usamos a gravação original.
       */
      console.warn(
        "Não foi possível ajustar a pausa editorial:",
        error,
      );

      return blob;
    }
  }
  async function obterAudioNeural(
    texto: string,
    estrutura: TipoBlocoLeitura[],
    continua: boolean,
    signal?: AbortSignal,
  ) {
    const chaveEstrutura =
      estrutura.join("|");

    const chaveCache =
      `estrutura::${chaveEstrutura}::${continua ? "continua" : "final"}::${texto}`;

    const existente =
      cacheAudioRef.current.get(
        chaveCache,
      );

    if (existente) {
      return existente;
    }

    const emPreparacao =
      audioEmPreparacaoRef.current.get(
        chaveCache,
      );

    if (emPreparacao) {
      return emPreparacao;
    }

    const requisicao =
      (async () => {
        const resposta =
          await fetch(
            "/api/audio/ler",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                texto,
                estrutura,
                continua,
              }),

              signal,
            },
          );

        if (!resposta.ok) {
          let mensagem =
            "Não foi possível gerar a leitura em áudio.";

          try {
            const data =
              (await resposta.json()) as {
                error?: string;
              };

            if (data.error) {
              mensagem =
                data.error;
            }
          } catch {
            // Mantém mensagem padrão.
          }

          throw new Error(
            mensagem,
          );
        }

        const blobOriginal =
          await resposta.blob();

        const blob =
          await ajustarPausaAposTitulo(
            blobOriginal,
            texto,
            estrutura,
          );

        cacheAudioRef.current.set(
          chaveCache,
          blob,
        );

        return blob;
      })();

    audioEmPreparacaoRef.current.set(
      chaveCache,
      requisicao,
    );

    try {
      return await requisicao;
    } finally {
      if (
        audioEmPreparacaoRef.current.get(
          chaveCache,
        ) === requisicao
      ) {
        audioEmPreparacaoRef.current.delete(
          chaveCache,
        );
      }
    }
  }
  function preCarregarProximoTrecho(
    indiceAtual: number,
  ) {
    const proximoIndice =
      indiceAtual + 1;

    const trecho =
      trechosRef.current[
        proximoIndice
      ];

    if (!trecho) {
      return;
    }

    const continua =
      proximoIndice + 1 <
      trechosRef.current.length;

    void obterAudioNeural(
      trecho.texto,
      trecho.estrutura,
      continua,
    ).catch(() => {
      /*
       * Se o pré-carregamento falhar,
       * a leitura normal tenta novamente.
       */
    });
  }

  function mostrarAvisoPreparandoAudio() {
    const id =
      "fdp-audio-preparando";

    let aviso =
      document.getElementById(
        id,
      );

    if (!aviso) {
      aviso =
        document.createElement(
          "div",
        );

      aviso.id = id;

      aviso.setAttribute(
        "role",
        "status",
      );

      aviso.setAttribute(
        "aria-live",
        "polite",
      );

      Object.assign(
        aviso.style,
        {
          position: "fixed",
          left: "50%",
          bottom: "92px",
          transform:
            "translateX(-50%)",
          zIndex: "10000",
          background: "#000000",
          color: "#FFFFFF",
          border:
            "1px solid #FFC400",
          borderRadius: "9999px",
          padding: "10px 15px",
          fontSize: "14px",
          fontWeight: "600",
          lineHeight: "1.2",
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.24)",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        },
      );

      document.body.appendChild(
        aviso,
      );
    }

    const tempoEstimado =
      aviso.dataset.tempoEstimado;

    aviso.textContent =
      tempoEstimado
        ? `Tempo estimado de leitura: ${tempoEstimado} · Preparando áudio…`
        : "Preparando áudio…";
  }

  function ocultarAvisoPreparandoAudio() {
    document
      .getElementById(
        "fdp-audio-preparando",
      )
      ?.remove();
  }
  async function falarTrecho(
    novoIndice: number,
  ) {
    const trechos =
      trechosRef.current;

    if (
      !trechos.length ||
      novoIndice < 0 ||
      novoIndice >= trechos.length
    ) {
      encerrarLeitura();
      return;
    }

    const trecho =
      trechos[novoIndice];

    const texto =
      trecho.texto;

    if (!texto) {
      encerrarLeitura();
      return;
    }

    sequenciaRef.current += 1;

    const minhaSequencia =
      sequenciaRef.current;

    limparAudioAtual();

    indiceRef.current =
      novoIndice;

    setIndice(
      novoIndice,
    );

    window.dispatchEvent(
      new CustomEvent(
        "fdp:audio-progress",
        {
          detail: {
            rootSelector:
              seletorAtualRef.current,
            index:
              novoIndice,
            total:
              trechosRef.current.length,
          },
        },
      ),
    );

    destacar(
      trecho.elementos,
    );

    ativoRef.current = true;
    pausadoRef.current = false;

    setAtivo(true);
    setPausado(false);

    const controller =
      new AbortController();

    requisicaoAudioRef.current =
      controller;

    /*
     * Enquanto esta seção é narrada,
     * a próxima já é preparada.
     */
    preCarregarProximoTrecho(
      novoIndice,
    );

    try {
      const timerAvisoPreparando =
        window.setTimeout(
          () => {
            mostrarAvisoPreparandoAudio();
          },
          0,
        );

      let blob: Blob;

      try {
        blob =
          await obterAudioNeural(
            texto,
            trecho.estrutura,
            novoIndice + 1 <
              trechos.length,
            controller.signal,
          );
      } finally {
        window.clearTimeout(
          timerAvisoPreparando,
        );

        ocultarAvisoPreparandoAudio();
      }

      if (
        minhaSequencia !==
        sequenciaRef.current
      ) {
        return;
      }

      requisicaoAudioRef.current =
        null;

      const url =
        URL.createObjectURL(
          blob,
        );

      audioUrlRef.current =
        url;

      const audio =
        new Audio(url);

      audioRef.current =
        audio;

      audio.playbackRate =
        velocidadeRef.current;

      audio.onended = () => {
        if (
          minhaSequencia !==
          sequenciaRef.current
        ) {
          return;
        }

        if (
          novoIndice + 1 <
          trechosRef.current.length
        ) {
          transicaoAudioRef.current =
            window.setTimeout(
              () => {
                transicaoAudioRef.current =
                  null;

                if (
                  minhaSequencia !==
                  sequenciaRef.current
                ) {
                  return;
                }

                void falarTrecho(
                  novoIndice + 1,
                );
              },
              PAUSA_ENTRE_TRECHOS_MS,
            );

          return;
        }

        window.dispatchEvent(
          new CustomEvent(
            "fdp:audio-complete",
            {
              detail: {
                rootSelector:
                  seletorAtualRef.current,
                total:
                  trechosRef.current.length,
              },
            },
          ),
        );

        removerDestaque();
        limparAudioAtual();

        ativoRef.current = false;
        pausadoRef.current = false;

        setAtivo(false);
        setPausado(false);
      };

      audio.onerror = () => {
        if (
          minhaSequencia !==
          sequenciaRef.current
        ) {
          return;
        }

        setErroAudio(
          "O áudio não pôde ser reproduzido.",
        );

        encerrarLeitura();
      };

      await audio.play();
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      if (
        minhaSequencia !==
        sequenciaRef.current
      ) {
        return;
      }

      setErroAudio(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar a leitura.",
      );

      encerrarLeitura();
    }
  }

  function iniciarLeitura(
    detail: AudioStartDetail,
  ) {
    setErroAudio("");

    const seletor =
      detail.rootSelector ||
      "main";

    const root =
      document.querySelector(
        seletor,
      );

    if (!root) {
      setErroAudio(
        "Não foi possível localizar o texto desta página.",
      );

      return;
    }

    const blocos =
      obterBlocos(root);

    if (!blocos.length) {
      setErroAudio(
        "Não encontramos texto editorial disponível para leitura.",
      );

      return;
    }

    const trechos =
      montarTrechos(
        blocos,
      );

    if (!trechos.length) {
      setErroAudio(
        "Não encontramos texto editorial disponível para leitura.",
      );

      return;
    }

    encerrarLeitura();

    blocosRef.current =
      blocos;

    trechosRef.current =
      trechos;

    const indiceInicial =
      Math.min(
        trechos.length - 1,
        Math.max(
          0,
          Number.isFinite(detail.startIndex)
            ? Math.floor(detail.startIndex ?? 0)
            : 0,
        ),
      );

    indiceRef.current =
      indiceInicial;

    seletorAtualRef.current =
      seletor;

    setIndice(indiceInicial);

    setTotal(
      trechos.length,
    );

    setTitulo(
      detail.title ||
        document.title.replace(
          " | Fora da Pauta",
          "",
        ) ||
        "Fora da Pauta",
    );

    /*
     * Estimativa visual antes do início da narração.
     * Referência: aproximadamente 150 palavras/minuto
     * na velocidade normal (1x).
     */
    const totalPalavrasFdp =
      trechos.reduce(
        (
          totalAtual,
          trecho,
        ) =>
          totalAtual +
          trecho.texto
            .split(/\s+/)
            .filter(Boolean)
            .length,
        0,
      );

    const minutosEstimadosFdp =
      Math.max(
        1,
        Math.ceil(
          totalPalavrasFdp / 150,
        ),
      );

    mostrarAvisoPreparandoAudio();

    const avisoTempoFdp =
      document.getElementById(
        "fdp-audio-preparando",
      );

    if (avisoTempoFdp) {
      const estimativaFdp =
        `~${minutosEstimadosFdp} min`;

      avisoTempoFdp.dataset.tempoEstimado =
        estimativaFdp;

      avisoTempoFdp.textContent =
        `Tempo estimado de leitura: ${estimativaFdp} · Preparando áudio…`;
    }

    void falarTrecho(indiceInicial);
  }
  /*
   * FDP_PRECARREGAMENTO_PRIMEIRO_AUDIO
   *
   * Prepara silenciosamente apenas o primeiro
   * trecho da leitura.
   *
   * Também funciona quando a Linha Editorial
   * estiver aberta em modal.
   */
  useEffect(() => {
    let cancelado = false;

    const timer =
      window.setTimeout(
        () => {
          if (cancelado) {
            return;
          }

          const root =
            modalAberto
              ? document.querySelector<HTMLElement>(
                  "#linha-editorial-modal",
                )
              : document.querySelector<HTMLElement>(
                  "[data-editorial-root]",
                );

          if (!root) {
            return;
          }

          const blocos =
            obterBlocos(root);

          if (!blocos.length) {
            return;
          }

          const trechos =
            montarTrechos(
              blocos,
            );

          const primeiro =
            trechos[0];

          if (!primeiro) {
            return;
          }

          const continua =
            trechos.length > 1;

          void obterAudioNeural(
            primeiro.texto,
            primeiro.estrutura,
            continua,
          ).catch(() => {
            /*
             * É apenas uma otimização.
             * Se falhar, o clique normal
             * fará uma nova tentativa.
             */
          });
        },

        /*
         * Começa quase imediatamente depois
         * de a interface estar montada.
         */
        30,
      );

    return () => {
      cancelado = true;

      window.clearTimeout(
        timer,
      );
    };
  }, [
    pathname,
    modalAberto,
    modoEditorial,
    markdown,
  ]);
  function alternarPausa() {
    if (!ativoRef.current) {
      return;
    }

    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    if (pausadoRef.current) {
      void audio.play();

      pausadoRef.current = false;
      setPausado(false);

      return;
    }

    audio.pause();

    pausadoRef.current = true;
    setPausado(true);
  }

  function anterior() {
    if (!trechosRef.current.length) {
      return;
    }

    void falarTrecho(
      Math.max(
        0,
        indiceRef.current - 1,
      ),
    );
  }

  function proximo() {
    if (!trechosRef.current.length) {
      return;
    }

    const proximoIndice =
      Math.min(
        trechosRef.current.length - 1,
        indiceRef.current + 1,
      );

    void falarTrecho(
      proximoIndice,
    );
  }
  function trocarVelocidade() {
    const atual =
      VELOCIDADES.indexOf(
        velocidadeRef.current,
      );

    const nova =
      VELOCIDADES[
        (atual + 1) %
          VELOCIDADES.length
      ];

    velocidadeRef.current =
      nova;

    setVelocidade(nova);

    if (audioRef.current) {
      audioRef.current.playbackRate =
        nova;
    }
  }

  async function carregarLinhaEditorial() {
    if (carregandoMarkdown) {
      return;
    }

    setMarkdown("");
    setCarregandoMarkdown(true);
    setErroMarkdown("");

    try {
      const resposta =
        await fetch(
          `/api/linha-editorial?t=${Date.now()}`,
          {
            cache: "no-store",
          },
        );

      if (!resposta.ok) {
        throw new Error(
          "Falha ao carregar Linha Editorial",
        );
      }

      const texto =
        await resposta.text();

      setMarkdown(texto);
    } catch {
      setErroMarkdown(
        "Não foi possível carregar a Linha Editorial agora.",
      );
    } finally {
      setCarregandoMarkdown(false);
    }
  }

  function abrirModal() {
    setModoEditorial("resumo");
    setModalAberto(true);
    void carregarLinhaEditorial();
  }

  function fecharModal() {
    if (
      seletorAtualRef.current.startsWith(
        "#linha-editorial-modal",
      )
    ) {
      encerrarLeitura();
    }

    setModalAberto(false);
    setModoEditorial("resumo");
  }

  useEffect(() => {
    const aoIniciarAudio = (
      evento: Event,
    ) => {
      const custom =
        evento as CustomEvent<AudioStartDetail>;

      iniciarLeitura(
        custom.detail ?? {},
      );
    };

    const aoAbrirEditorial = () => {
      abrirModal();
    };

    window.addEventListener(
      "fdp:audio-start",
      aoIniciarAudio,
    );

    window.addEventListener(
      "fdp:editorial-open",
      aoAbrirEditorial,
    );

    return () => {
      window.removeEventListener(
        "fdp:audio-start",
        aoIniciarAudio,
      );

      window.removeEventListener(
        "fdp:editorial-open",
        aoAbrirEditorial,
      );
    };
    // Os manipuladores usam refs para o estado do player.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown, carregandoMarkdown]);

  useEffect(() => {
    encerrarLeitura();
    setModalAberto(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!modalAberto) {
      return;
    }

    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function aoTeclado(
      evento: KeyboardEvent,
    ) {
      if (evento.key === "Escape") {
        fecharModal();
      }
    }

    window.addEventListener(
      "keydown",
      aoTeclado,
    );

    return () => {
      document.body.style.overflow =
        overflowAnterior;

      window.removeEventListener(
        "keydown",
        aoTeclado,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalAberto]);

  const progresso =
    total > 0
      ? ((indice + 1) / total) * 100
      : 0;

  return (
    <>
      {modalAberto ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="linha-editorial-modal-titulo"
          onMouseDown={(evento) => {
            if (
              evento.target ===
              evento.currentTarget
            ) {
              fecharModal();
            }
          }}
        >
          <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden bg-[#eeeee9] shadow-2xl sm:rounded-[28px]">
            <div
              className="h-1.5 shrink-0 bg-[#FFC400]"
              aria-hidden="true"
            />

            <div className="flex shrink-0 items-start justify-between gap-6 border-b border-black/10 px-5 py-5 sm:px-8">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/40">
                  Como trabalhamos
                </p>

                <h2
                  id="linha-editorial-modal-titulo"
                  className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl"
                >
                  Linha Editorial
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                aria-label="Fechar Linha Editorial"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/15 text-xl transition hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC400]"
              >
                ×
              </button>
            </div>

            {modoEditorial === "resumo" ? (
              <>
                <div className="shrink-0 border-b border-black/10 bg-white/50 px-5 py-4 sm:px-8">
                  <button
                    type="button"
                    onClick={() =>
                      iniciarLeitura({
                        rootSelector:
                          "#linha-editorial-modal-resumo",
                        title:
                          "Linha Editorial — resumo",
                      })
                    }
                    className="inline-flex items-center gap-2 text-sm font-semibold"
                  >
                    <span
                      aria-hidden="true"
                      className="text-[#FFC400]"
                    >
                      ▶
                    </span>
                    Ouvir linha editorial
                  </button>
                </div>

                <div
                  id="linha-editorial-modal-scroll"
                  className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-7"
                >
                  <div
                    id="linha-editorial-modal-resumo"
                    className="mx-auto max-w-3xl"
                  >
                    <p className="text-sm leading-7 text-black/55">
                      Estes são os princípios centrais que orientam
                      o trabalho do Fora da Pauta.
                    </p>

                    <div className="mt-5 divide-y divide-black/10 border-y border-black/10">
                      <div className="flex gap-4 py-4">
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFC400] text-sm font-bold text-black"
                        >
                          1
                        </span>

                        <p className="pt-0.5 text-base leading-7 text-black/75 sm:text-lg">
                          O Fora da Pauta não é acusatório nem
                          promocional. É documental.
                        </p>
                      </div>

                      <div className="flex gap-4 py-4">
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFC400] text-sm font-bold text-black"
                        >
                          2
                        </span>

                        <p className="pt-0.5 text-base leading-7 text-black/75 sm:text-lg">
                          A importância de um fato para o Fora da
                          Pauta não é determinada pela quantidade
                          de exposição que ele recebeu.
                        </p>
                      </div>

                      <div className="flex gap-4 py-4">
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFC400] text-sm font-bold text-black"
                        >
                          3
                        </span>

                        <p className="pt-0.5 text-base leading-7 text-black/75 sm:text-lg">
                          O que pode ser verificado?
                        </p>
                      </div>

                      <div className="flex gap-4 py-4">
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFC400] text-sm font-bold text-black"
                        >
                          4
                        </span>

                        <p className="pt-0.5 text-base leading-7 text-black/75 sm:text-lg">
                          Informar para que a pessoa possa decidir,
                          não decidir por ela.
                        </p>
                      </div>

                      <div className="flex gap-4 py-4">
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFC400] text-sm font-bold text-black"
                        >
                          5
                        </span>

                        <p className="pt-0.5 text-base leading-7 text-black/75 sm:text-lg">
                          Incluir o povo no debate.
                        </p>
                      </div>

                      <div className="flex gap-4 py-4">
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFC400] text-sm font-bold text-black"
                        >
                          6
                        </span>

                        <p className="pt-0.5 text-base leading-7 text-black/75 sm:text-lg">
                          Registrar e preservar a trajetória pública
                          de quem exerce poder.
                        </p>
                      </div>

                      <div className="flex gap-4 py-4">
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFC400] text-sm font-bold text-black"
                        >
                          7
                        </span>

                        <p className="pt-0.5 text-base leading-7 text-black/75 sm:text-lg">
                          A cronologia deve seguir a data dos
                          acontecimentos, não a data em que foram
                          encontrados.
                        </p>
                      </div>

                      <div className="flex gap-4 py-4">
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFC400] text-sm font-bold text-black"
                        >
                          8
                        </span>

                        <p className="pt-0.5 text-base leading-7 text-black/75 sm:text-lg">
                          Preservar a divergência e impedir que o
                          debate se transforme em ataque às pessoas.
                        </p>
                      </div>

                      <div className="flex gap-4 py-4">
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFC400] text-sm font-bold text-black"
                        >
                          9
                        </span>

                        <p className="pt-0.5 text-base leading-7 text-black/75 sm:text-lg">
                          Proteger a identidade de quem participa
                          anonimamente.
                        </p>
                      </div>

                      <div className="flex gap-4 py-4">
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFC400] text-sm font-bold text-black"
                        >
                          10
                        </span>

                        <p className="pt-0.5 text-base leading-7 text-black/75 sm:text-lg">
                          A sustentabilidade deve ser distribuída e
                          transparente; contribuir financeiramente
                          não é condição para participar.
                        </p>
                      </div>

                      <div className="flex gap-4 py-4">
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFC400] text-sm font-bold text-black"
                        >
                          11
                        </span>

                        <p className="pt-0.5 text-base leading-7 text-black/75 sm:text-lg">
                          Não apenas disponibilizar informação,
                          mas criar meios para que ela chegue
                          às pessoas.
                        </p>
                      </div>

                      <div className="flex gap-4 py-4">
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFC400] text-sm font-bold text-black"
                        >
                          12
                        </span>

                        <p className="pt-0.5 text-base leading-7 text-black/75 sm:text-lg">
                          A pauta pode nascer de qualquer pessoa.
                          O tratamento do conteúdo é determinado
                          pelas regras editoriais, não por quem
                          fez a sugestão.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (
                          seletorAtualRef.current ===
                          "#linha-editorial-modal-resumo"
                        ) {
                          encerrarLeitura();
                        }

                        setModoEditorial("completo");

                        requestAnimationFrame(() => {
                          document
                            .getElementById(
                              "linha-editorial-modal-scroll",
                            )
                            ?.scrollTo({
                              top: 0,
                              behavior: "smooth",
                            });
                        });
                      }}
                      className="mt-6 inline-flex w-full items-center justify-between bg-[#FFC400] px-5 py-4 text-left text-sm font-semibold text-black transition hover:bg-[#e9b300] sm:w-auto sm:min-w-[310px]"
                    >
                      <span>
                        Ler linha editorial completa
                      </span>

                      <span aria-hidden="true">
                        →
                      </span>
                    </button>

                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={fecharModal}
                        className="text-sm font-medium text-black/55 underline decoration-black/20 underline-offset-4 transition hover:text-black"
                      >
                        Fechar e voltar
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="shrink-0 border-b border-black/10 bg-white/50 px-5 py-4 sm:px-8">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          seletorAtualRef.current ===
                          "#linha-editorial-modal-content"
                        ) {
                          encerrarLeitura();
                        }

                        setModoEditorial("resumo");

                        requestAnimationFrame(() => {
                          document
                            .getElementById(
                              "linha-editorial-modal-scroll",
                            )
                            ?.scrollTo({
                              top: 0,
                              behavior: "smooth",
                            });
                        });
                      }}
                      className="text-sm font-semibold text-black/55 transition hover:text-black"
                    >
                      ← Voltar ao resumo
                    </button>

                    <span
                      aria-hidden="true"
                      className="text-black/20"
                    >
                      ·
                    </span>

                    <button
                      type="button"
                      disabled={
                        !markdown ||
                        carregandoMarkdown
                      }
                      onClick={() =>
                        iniciarLeitura({
                          rootSelector:
                            "#linha-editorial-modal-content",
                          title:
                            "Linha Editorial",
                        })
                      }
                      className="inline-flex items-center gap-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <span
                        aria-hidden="true"
                        className="text-[#FFC400]"
                      >
                        ▶
                      </span>
                      Ouvir texto completo
                    </button>
                  </div>
                </div>

                <div
                  id="linha-editorial-modal-scroll"
                  className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-7"
                >
                  {carregandoMarkdown ? (
                    <p className="text-sm text-black/50">
                      Carregando…
                    </p>
                  ) : erroMarkdown ? (
                    <p className="text-sm text-black/60">
                      {erroMarkdown}
                    </p>
                  ) : (
                    <div
                      id="linha-editorial-modal-content"
                      className="mx-auto max-w-3xl"
                    >
                      <MarkdownDocument
                        markdown={markdown}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {ativo ? (
        <div
          data-editorial-ignore
          className="fixed inset-x-3 bottom-3 z-[120] mx-auto max-w-2xl overflow-hidden rounded-2xl bg-black text-white shadow-[0_20px_70px_rgba(0,0,0,0.35)] sm:bottom-5"
          aria-label="Controles da leitura em áudio"
        >
          <div
            className="h-1 bg-[#FFC400] transition-[width]"
            style={{
              width: `${progresso}%`,
            }}
          />

          <div className="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4">
            <button
              type="button"
              onClick={anterior}
              aria-label="Trecho anterior"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-lg hover:bg-white/10"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={alternarPausa}
              aria-label={
                pausado
                  ? "Continuar leitura"
                  : "Pausar leitura"
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFC400] font-bold text-black"
            >
              {pausado ? "▶" : "❚❚"}
            </button>

            <button
              type="button"
              onClick={proximo}
              aria-label="Próximo trecho"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-lg hover:bg-white/10"
            >
              ›
            </button>

            <div className="min-w-0 flex-1 px-1">
              <p className="truncate text-xs font-semibold sm:text-sm">
                {titulo}
              </p>

              <p className="mt-0.5 text-[10px] text-white/45">
                Trecho {indice + 1} de{" "}
                {total}
              </p>
            </div>

            <button
              type="button"
              onClick={trocarVelocidade}
              aria-label="Alterar velocidade da leitura"
              className="shrink-0 rounded-full border border-white/15 px-2.5 py-1.5 text-xs font-semibold hover:bg-white/10"
            >
              {velocidade}x
            </button>

            <button
              type="button"
              onClick={encerrarLeitura}
              aria-label="Encerrar leitura"
              className="flex h-8 w-8 shrink-0 items-center justify-center text-lg text-white/55 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}

      {erroAudio ? (
        <div
          data-editorial-ignore
          role="status"
          className="fixed bottom-5 left-5 z-[130] max-w-sm rounded-xl bg-black px-4 py-3 text-sm text-white shadow-xl"
        >
          {erroAudio}

          <button
            type="button"
            onClick={() =>
              setErroAudio("")
            }
            className="ml-3 text-[#FFC400]"
          >
            Fechar
          </button>
        </div>
      ) : null}
    </>
  );
}
