"use client";

import Image from "next/image";
import styles from "@/app/page.module.css";

/**
 * Explica onde fica o botão INICIAR antes do visitante abrir o Telegram.
 * O exemplo é ilustrativo: o botão real pertence ao aplicativo Telegram.
 */
export function OrientacoesConclusaoTelegram({
  abrindoTelegram,
  onContinuar,
}: {
  abrindoTelegram: boolean;
  onContinuar: () => void;
}) {
  return (
    <div className={styles.orientacaoDepoisInstalacao}>
      <h3 className={styles.tituloInstalacao}>Antes de abrir o Telegram, veja onde tocar</h3>
      <p>Procure a conversa <strong>Fora da Pauta — Avisos</strong>, com o símbolo dos dois traços, branco e amarelo.</p>
      <div
        className={styles.telaTelegramExemplo}
        role="img"
        aria-label="Exemplo ilustrativo da conversa Fora da Pauta — Avisos. O botão azul INICIAR fica na parte inferior da tela."
      >
        <div className={styles.telegramExemploTopo}>
          <Image
            src="/marca/fora-da-pauta-icone.svg"
            alt=""
            width={40}
            height={40}
            className={styles.telegramExemploIcone}
          />
          <div>
            <strong>Fora da Pauta — Avisos</strong>
            <small>Telegram</small>
          </div>
        </div>
        <div className={styles.telegramExemploCorpo}>
          <span className={styles.telegramExemploDica}>↓ Toque neste botão no Telegram</span>
          <div className={styles.telegramExemploBotao}>INICIAR</div>
        </div>
      </div>
      <p className={styles.telegramLegendaExemplo}>Exemplo da tela. O botão INICIAR de verdade aparecerá no aplicativo Telegram.</p>
      <p><strong>Quando a conversa abrir:</strong> toque em <strong>INICIAR</strong> (ou <strong>START</strong>) na parte inferior. Aguarde a mensagem <strong>“Sua inscrição no Fora da Pauta está confirmada!”</strong>.</p>
      <p>Se aparecer apenas a lista de conversas, procure e abra <strong>Fora da Pauta — Avisos</strong>. Se não aparecer INICIAR nem a confirmação, volte ao Fora da Pauta para tentar novamente.</p>
      <button
        type="button"
        onClick={onContinuar}
        disabled={abrindoTelegram}
        className={styles.opcaoTelegramSecundaria}
      >
        {abrindoTelegram ? "Abrindo Telegram..." : "Continuar inscrição"}
      </button>
    </div>
  );
}
