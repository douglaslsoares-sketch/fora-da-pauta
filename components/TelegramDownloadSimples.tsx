"use client";

import { useState } from "react";
import type { PlataformaTelegram } from "@/components/OrientacoesInstalacaoTelegram";
import styles from "@/app/page.module.css";

type Props = {
  plataforma: PlataformaTelegram;
  abrindoTelegram: boolean;
  onContinuar: () => void;
};

/** Prévia: uma ação azul por etapa e ajuda recolhida. */
export function TelegramDownloadSimples({ plataforma, abrindoTelegram, onContinuar }: Props) {
  const [downloadAberto, setDownloadAberto] = useState(false);
  const celular = plataforma === "android" || plataforma === "ios";

  return (
    <div className={styles.resumoDownloadTelegram}>
      {downloadAberto ? (
        <button
          type="button"
          className={styles.opcaoTelegramInscrever}
          onClick={onContinuar}
          disabled={abrindoTelegram}
        >
          {abrindoTelegram ? "Abrindo Telegram..." : "Continuar inscrição"}
        </button>
      ) : (
        <a
          href="/instalar-telegram"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.opcaoTelegramInscrever}
          onClick={() => setDownloadAberto(true)}
        >
          Baixar o Telegram
        </a>
      )}

      <p className={styles.resumoDownloadTexto}>
        {downloadAberto
          ? "Depois de instalar e abrir o Telegram, volte aqui e toque em Continuar inscrição."
          : "Depois de instalar, volte aqui para continuar sua inscrição."}
      </p>

      <details className={styles.ajudaDownloadTelegram}>
        <summary>Precisa de ajuda para instalar?</summary>
        <div className={styles.ajudaDownloadConteudo}>
          {plataforma === "windows" ? (
            <p>Na página do Telegram, clique em <strong>Baixe o Telegram para Windows</strong>. Salve o arquivo. Quando o download terminar, abra o arquivo com dois cliques e siga as instruções de instalação.</p>
          ) : plataforma === "macos" ? (
            <p>Escolha a versão para <strong>Mac</strong> ou a <strong>Mac App Store</strong>. Se baixar um arquivo, abra-o com dois cliques e siga as instruções. Na App Store, toque em <strong>Obter</strong>.</p>
          ) : plataforma === "linux" ? (
            <p>Escolha a versão para <strong>Linux</strong> ou procure Telegram Desktop na loja de aplicativos do seu sistema. Siga as instruções da versão escolhida.</p>
          ) : celular ? (
            <p>Na {plataforma === "android" ? "Play Store" : "App Store"}, toque em <strong>{plataforma === "android" ? "Instalar" : "Obter"}</strong>, espere terminar e abra o Telegram.</p>
          ) : (
            <p>Na página oficial, escolha a versão adequada ao seu aparelho, siga as instruções de instalação e abra o Telegram.</p>
          )}
          {!celular && (
            <p>Não encontrou o arquivo? Procure o símbolo de downloads no navegador ou abra a pasta <strong>Downloads</strong> do computador.</p>
          )}
          <p>Se ainda não tiver uma conta do Telegram, siga as instruções do aplicativo. Depois, volte ao Fora da Pauta.</p>
        </div>
      </details>
    </div>
  );
}
