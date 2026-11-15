"use client";

import Image from "next/image";
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
      <h3 className={styles.tituloInstalacao}>Antes de abrir o Telegram, veja o que fazer</h3>
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
      <p className={styles.telegramLegendaExemplo}>Exemplo para uma primeira conversa. Se você já conversou com o Fora da Pauta, a tela pode ser diferente.</p>
      <p><strong>Primeira conversa:</strong> toque em <strong>INICIAR</strong> (ou <strong>START</strong>) na parte inferior da tela do Telegram.</p>
      <p>Se aparecer apenas a lista de conversas, procure e abra <strong>Fora da Pauta — Avisos</strong>. Se a conversa já tiver mensagens antigas, é possível que não apareça INICIAR.</p>
      <button
        type="button"
        className={styles.ajudaInstalacao}
        aria-expanded={exibirAjudaAnterior}
        onClick={() => setExibirAjudaAnterior(anterior => !anterior)}
      >
        {exibirAjudaAnterior ? "Ocultar orientação" : "Não apareceu INICIAR?"}
      </button>
      {exibirAjudaAnterior && (
        <div className={styles.telegramAjudaConversaAntiga}>
          <p>Se o Telegram abriu uma conversa antiga e não apresentou o botão INICIAR, volte a esta página. Use o botão abaixo para copiar o comando de inscrição e cole-o no campo de mensagem da conversa <strong>Fora da Pauta — Avisos</strong>. Depois, pressione <strong>Enter</strong> ou toque em <strong>Enviar</strong>.</p>
          {comandoPendente ? (
            <button
              type="button"
              className={styles.ajudaInstalacao}
              onClick={onCopiar}
            >
              {comandoCopiado ? "Comando copiado!" : "Copiar comando de inscrição"}
            </button>
          ) : (
            <p><strong>Primeiro toque em Continuar inscrição.</strong> Se o botão INICIAR não aparecer no Telegram, volte para copiar o comando desta tentativa.</p>
          )}
          {comandoCopiado && <p role="status">Agora cole o comando na conversa Fora da Pauta — Avisos e envie.</p>}
          {erroCopia && (
            <p role="alert">Não foi possível copiar automaticamente. Selecione e copie este comando: <code className={styles.telegramComandoFallback}>{comandoPendente}</code></p>
          )}
          <p>O código vale por poucos minutos. Se não funcionar, toque novamente em <strong>Continuar inscrição</strong> para gerar outro.</p>
        </div>
      )}
      <p>Aguarde uma <strong>nova mensagem</strong> dizendo <strong>“Sua inscrição no Fora da Pauta está confirmada!”</strong>. Mensagens antigas não confirmam a inscrição atual.</p>
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
