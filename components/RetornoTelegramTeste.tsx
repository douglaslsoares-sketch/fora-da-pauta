"use client";

import Script from "next/script";
import { useState } from "react";

type TelegramMiniApp = {
  initData?: string;
  ready?: () => void;
  close?: () => void;
};

function miniApp(): TelegramMiniApp | undefined {
  return (window as unknown as {
    Telegram?: { WebApp?: TelegramMiniApp };
  }).Telegram?.WebApp;
}

export function RetornoTelegramTeste() {
  const [abertoNoTelegram, setAbertoNoTelegram] = useState(false);

  function preparar() {
    const app = miniApp();
    if (app?.initData) {
      setAbertoNoTelegram(true);
      app.ready?.();
    }
  }

  function voltar() {
    const app = miniApp();
    if (app?.initData && app.close) {
      app.close();
    } else {
      window.location.assign("https://t.me/ForaDaPautaAcompanhaBot");
    }
  }

  return (
    <div className="space-y-3">
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
        onReady={preparar}
      />
      <button
        type="button"
        onClick={voltar}
        className="inline-flex min-h-12 w-full items-center justify-center bg-[#FFC400] px-5 py-3 text-center font-semibold text-black hover:bg-[#e9b300]"
      >
        Voltar ao Telegram
      </button>
      <p className="text-sm leading-6 text-black/60">
        {abertoNoTelegram
          ? "O botão fecha esta leitura e devolve você à conversa onde está a notificação e o menu."
          : "Se você abriu este link fora do Telegram, o botão abre a conversa do bot. A volta exata à notificação será testada dentro do aplicativo."}
      </p>
    </div>
  );
}
