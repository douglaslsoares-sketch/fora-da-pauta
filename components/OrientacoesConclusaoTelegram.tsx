"use client";

import { useState } from "react";
import styles from "@/app/page.module.css";

/**
 * Explica onde fica o botão INICIAR antes do visitante abrir o Telegram.
 * O exemplo é ilustrativo: o botão real pertence ao aplicativo Telegram.
 */
export function OrientacoesConclusaoTelegram({
  abrindoTelegram,
  onContinuar,
  comandoPendente,
  comandoCopiado,
  erroCopia,
  onCopiar,
}: {
  abrindoTelegram: boolean;
  onContinuar: () => void;
  comandoPendente: string;
  comandoCopiado: boolean;
  erroCopia: boolean;
  onCopiar: () => void;
}) {
  const [exibirAjudaAnterior, setExibirAjudaAnterior] = useState(false);
  return (
    <div className={styles.orientacaoDepoisInstalacao}>
      <h3 className={styles.tituloInstalacao}>Agora vamos concluir sua inscrição</h3>
      <p>Ao abrir o Telegram, procure a conversa <strong>Fora da Pauta — Avisos</strong>. Se aparecer <strong>INICIAR</strong>, toque nele.</p>
      <p>Depois, aguarde a nova mensagem confirmando sua inscrição.</p>
      <button
        type="button"
        onClick={onContinuar}
        disabled={abrindoTelegram}
        className={styles.opcaoTelegramSecundaria}
      >
        {abrindoTelegram ? "Abrindo Telegram..." : "Continuar inscrição"}
      </button>
      <button type="button" className={styles.ajudaInstalacao} aria-expanded={exibirAjudaAnterior} onClick={() => setExibirAjudaAnterior(v => !v)}>
        {exibirAjudaAnterior ? "Ocultar ajuda" : "Não apareceu INICIAR? Preciso de ajuda"}
      </button>
      {exibirAjudaAnterior ? (
        <div className={styles.telegramAjudaConversaAntiga}>
          <p>Se já houver mensagens antigas, o botão INICIAR pode não aparecer. Volte aqui após tocar em <strong>Continuar inscrição</strong> e copie o comando desta tentativa.</p>
          {comandoPendente ? (
            <button type="button" className={styles.ajudaInstalacao} onClick={onCopiar}>
              {comandoCopiado ? "Comando copiado!" : "Copiar comando de inscrição"}
            </button>
          ) : <p>Primeiro toque em <strong>Continuar inscrição</strong> para gerar o comando.</p>}
          {comandoCopiado ? <p role="status">Cole o comando na conversa Fora da Pauta — Avisos e envie.</p> : null}
          {erroCopia ? <p role="alert">Copie manualmente: <code className={styles.telegramComandoFallback}>{comandoPendente}</code></p> : null}
        </div>
      ) : null}

    </div>
  );
}
