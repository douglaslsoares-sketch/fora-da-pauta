"use client";

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
  const windows = plataforma === "windows";
  const android = plataforma === "android";
  const ios = plataforma === "ios";
  const macos = plataforma === "macos";
  const linux = plataforma === "linux";
  const chromeos = plataforma === "chromeos";
  const computador = !android && !ios;

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
            <li><strong>Salvar não instala o Telegram.</strong> Pressione as teclas <strong>Windows + E</strong> para abrir as pastas do computador e entre em <strong>Downloads</strong>.</li>
            <li>Encontre o arquivo do Telegram, dê dois cliques nele e siga as instruções de instalação.</li>
            <li>Abra o Telegram e entre na sua conta. Depois, volte à guia <strong>Fora da Pauta</strong> e escolha <strong>Continuar inscrição</strong>.</li>
          </>
        ) : macos ? (
          <>
            <li>Na página oficial, escolha <strong>Baixe o Telegram para macOS</strong> ou a opção <strong>Mac App Store</strong>.</li>
            <li>Se usar a App Store, clique em <strong>Obter</strong>. Se baixar um arquivo, abra-o e siga as orientações para colocar o Telegram em <strong>Aplicativos</strong>.</li>
            <li>Abra o Telegram, entre na sua conta e depois volte à guia <strong>Fora da Pauta</strong>.</li>
            <li>Escolha <strong>Continuar inscrição</strong>.</li>
          </>
        ) : linux ? (
          <>
            <li>Na página oficial, escolha a opção para <strong>Linux</strong>. Você também pode procurar <strong>Telegram Desktop</strong> na loja de aplicativos do seu sistema.</li>
            <li>Instale pela loja ou siga as orientações da versão oferecida (<strong>Flatpak, Snap ou download</strong>). O procedimento varia conforme o Linux utilizado.</li>
            <li>Abra o Telegram, entre na sua conta e volte à guia <strong>Fora da Pauta</strong>.</li>
            <li>Escolha <strong>Continuar inscrição</strong>.</li>
          </>
        ) : chromeos ? (
          <>
            <li>Na <strong>Play Store</strong> do Chromebook, toque em <strong>Instalar</strong>, caso essa loja esteja disponível.</li>
            <li>Abra o Telegram e entre na sua conta. Caso seu Chromebook não ofereça Play Store, consulte as alternativas na <strong>página oficial do Telegram</strong>.</li>
            <li>Volte ao Fora da Pauta e toque em <strong>Continuar inscrição</strong>.</li>
          </>
        ) : android || ios ? (
          <>
            <li>Na {android ? "Play Store" : "App Store"}, toque em <strong>{android ? "Instalar" : "Obter"}</strong> e espere terminar.</li>
            <li>Abra o Telegram e siga as orientações da própria instalação.</li>
            <li>Volte ao Fora da Pauta e toque em <strong>Continuar inscrição</strong>.</li>
          </>
        ) : (
          <>
            <li>Na página oficial, escolha a opção compatível com seu dispositivo.</li>
            <li>Siga as instruções da loja ou do sistema para instalar o Telegram, se houver uma versão disponível.</li>
            <li>Depois de abrir o Telegram, volte ao <strong>Fora da Pauta</strong> e escolha <strong>Continuar inscrição</strong>.</li>
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
