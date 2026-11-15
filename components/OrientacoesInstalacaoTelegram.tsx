"use client";

import styles from "@/app/page.module.css";

export type PlataformaTelegram = "android" | "ios" | "windows" | "outro";

export function OrientacoesInstalacaoTelegram({
  plataforma,
  abrindoTelegram,
  onContinuar,
}: {
  plataforma: PlataformaTelegram;
  abrindoTelegram: boolean;
  onContinuar: () => void;
}) {
  const windows = plataforma === "windows";
  const android = plataforma === "android";
  const ios = plataforma === "ios";
  const computador = windows || (!android && !ios);

  return (
    <div className={styles.instrucoesTelegram}>
      <h3 className={styles.tituloInstalacao}>
        {computador ? "Como instalar no computador" : "Como instalar no celular"}
      </h3>
      <ol className={styles.passosInstalacao}>
        <li>Toque em <strong>Instalar o Telegram</strong>. A página oficial abrirá em outra guia.</li>
        {windows ? (
          <>
            <li>Na página do Telegram, clique em <strong>Baixe o Telegram para Windows</strong> e depois em <strong>Salvar</strong>.</li>
            <li><strong>Atenção: salvar não instala o aplicativo.</strong> No Chrome, clique no ícone de downloads (seta para baixo) no alto à direita. Se não o encontrar, pressione <strong>Ctrl + J</strong>.</li>
            <li>Abra o arquivo do Telegram que você acabou de baixar e siga as instruções da instalação.</li>
            <li>Abra o Telegram e entre na sua conta. Depois, volte à guia <strong>Fora da Pauta</strong> e escolha <strong>Continuar inscrição</strong>.</li>
          </>
        ) : android || ios ? (
          <>
            <li>Na {android ? "Play Store" : "App Store"}, toque em <strong>{android ? "Instalar" : "Obter"}</strong> e espere terminar.</li>
            <li>Abra o Telegram e siga as orientações da própria instalação.</li>
            <li>Volte ao Fora da Pauta e toque em <strong>Continuar inscrição</strong>.</li>
          </>
        ) : (
          <>
            <li>Na página de instalação, baixe a versão para seu computador e salve o arquivo.</li>
            <li><strong>Salvar não instala o aplicativo:</strong> abra o arquivo baixado e siga as instruções de instalação.</li>
            <li>Abra o Telegram. Depois, volte à guia <strong>Fora da Pauta</strong> e escolha <strong>Continuar inscrição</strong>.</li>
          </>
        )}
      </ol>
      <a href="/instalar-telegram" target="_blank" rel="noopener noreferrer" className={styles.opcaoTelegram}>
        Instalar o Telegram
      </a>
      <button type="button" onClick={onContinuar} disabled={abrindoTelegram} className={styles.opcaoTelegramSecundaria}>
        {abrindoTelegram ? "Abrindo Telegram..." : "Continuar inscrição"}
      </button>
    </div>
  );
}
