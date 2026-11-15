"use client";

import { useState } from "react";
import { OrientacoesConclusaoTelegram } from "@/components/OrientacoesConclusaoTelegram";
import styles from "@/app/page.module.css";

export type PlataformaTelegram = "android" | "ios" | "windows" | "macos" | "linux" | "chromeos" | "outro";

export function OrientacoesInstalacaoTelegram({
  plataforma,
  abrindoTelegram,
  onContinuar,
}: {
  plataforma: PlataformaTelegram;
  abrindoTelegram: boolean;
  onContinuar: () => void;
}) {
  const [mostrarAjuda, setMostrarAjuda] = useState(false);
  const windows = plataforma === "windows";
  const macos = plataforma === "macos";
  const linux = plataforma === "linux";
  const chromeos = plataforma === "chromeos";
  const android = plataforma === "android";
  const ios = plataforma === "ios";
  const computador = !android && !ios;

  return (
    <div className={styles.instrucoesTelegram}>
      <h3 className={styles.tituloInstalacao}>
        {computador ? "Como instalar no computador" : "Como instalar no celular"}
      </h3>

      <ol className={styles.passosInstalacao}>
        {windows ? (
          <>
            <li>Toque em <strong>Instalar o Telegram</strong>. Na página que abrir, clique em <strong>Baixe o Telegram para Windows</strong> e depois em <strong>Salvar</strong>.</li>
            <li><strong>Salvar não instala o programa.</strong> Quando terminar de baixar, localize o arquivo e <strong>dê dois cliques nele</strong> para começar a instalação. Siga as instruções na tela.</li>
            <li>Abra o Telegram, entre na sua conta, volte ao <strong>Fora da Pauta</strong> e toque em <strong>Continuar inscrição</strong>.</li>
          </>
        ) : macos ? (
          <>
            <li>Toque em <strong>Instalar o Telegram</strong> e escolha a versão para <strong>Mac</strong> ou a <strong>Mac App Store</strong>.</li>
            <li>Se baixar um arquivo, <strong>dê dois cliques nele</strong> e siga as instruções para instalar o Telegram. Se usar a App Store, clique em <strong>Obter</strong>.</li>
            <li>Abra o Telegram, entre na sua conta e volte ao <strong>Fora da Pauta</strong> para tocar em <strong>Continuar inscrição</strong>.</li>
          </>
        ) : linux ? (
          <>
            <li>Toque em <strong>Instalar o Telegram</strong> e escolha a versão para <strong>Linux</strong> ou procure o Telegram na loja de aplicativos do seu sistema.</li>
            <li>Siga as instruções da loja ou da versão escolhida. A instalação varia conforme o Linux utilizado.</li>
            <li>Abra o Telegram, entre na sua conta e volte ao <strong>Fora da Pauta</strong> para tocar em <strong>Continuar inscrição</strong>.</li>
          </>
        ) : chromeos ? (
          <>
            <li>Toque em <strong>Instalar o Telegram</strong> para abrir a <strong>Play Store</strong>, se disponível no Chromebook.</li>
            <li>Toque em <strong>Instalar</strong> e, depois, abra o Telegram. Se não tiver Play Store, consulte as opções oficiais para seu aparelho.</li>
            <li>Entre na sua conta e volte ao <strong>Fora da Pauta</strong> para tocar em <strong>Continuar inscrição</strong>.</li>
          </>
        ) : android || ios ? (
          <>
            <li>Toque em <strong>Instalar o Telegram</strong> para abrir a {android ? "Play Store" : "App Store"}.</li>
            <li>Toque em <strong>{android ? "Instalar" : "Obter"}</strong> e espere terminar. Depois abra o Telegram e entre na sua conta.</li>
            <li>Volte ao <strong>Fora da Pauta</strong> e toque em <strong>Continuar inscrição</strong>.</li>
          </>
        ) : (
          <>
            <li>Toque em <strong>Instalar o Telegram</strong> e escolha a versão oficial para seu aparelho.</li>
            <li>Siga as instruções da loja ou da página de instalação, quando houver uma versão disponível.</li>
            <li>Abra o Telegram, entre na sua conta e volte ao <strong>Fora da Pauta</strong> para tocar em <strong>Continuar inscrição</strong>.</li>
          </>
        )}
      </ol>

      {(windows || macos || linux) && (
        <>
          <button
            type="button"
            className={styles.ajudaInstalacao}
            onClick={() => setMostrarAjuda(anterior => !anterior)}
            aria-expanded={mostrarAjuda}
          >
            {mostrarAjuda ? "Ocultar ajuda" : "Não encontrou o arquivo baixado?"}
          </button>
          {mostrarAjuda && (
            <p className={styles.textoAjudaInstalacao}>
              Procure o símbolo de downloads (geralmente uma seta para baixo) no navegador.
              {" "}Se não encontrar, abra a pasta <strong>Downloads</strong> do computador
              {windows ? " e dê dois cliques no arquivo de instalação do Telegram." : macos ? " no Finder e dê dois cliques no arquivo baixado." : " e consulte as instruções da versão baixada."}
            </p>
          )}
        </>
      )}

      <a href="/instalar-telegram" target="_blank" rel="noopener noreferrer" className={styles.opcaoTelegram}>
        Instalar o Telegram
      </a>
      <OrientacoesConclusaoTelegram
        abrindoTelegram={abrindoTelegram}
        onContinuar={onContinuar}
      />
    </div>
  );
}
