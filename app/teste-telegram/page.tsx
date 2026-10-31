import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Teste de navegação pelo Telegram",
  robots: { index: false, follow: false },
};

export default function TesteTelegram() {
  return (
    <main className="min-h-screen bg-white text-[#161616]">
      <div className="mx-auto max-w-2xl px-5 py-10 sm:py-16">
        <div className="border-l-4 border-[#E5B600] bg-[#fff8d8] px-4 py-3 text-sm font-semibold">
          SIMULAÇÃO DE NAVEGAÇÃO — NÃO É UMA EDIÇÃO PUBLICADA
        </div>
        <p className="mt-10 text-xs font-bold uppercase tracking-widest text-neutral-500">Fora da Pauta · Teste Telegram</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Há mais para entender.</h1>
        <p className="mt-5 text-lg leading-8">Esta é uma página de teste para verificar o caminho entre uma notificação no Telegram e um artigo no site.</p>
        <section className="mt-10 border-t border-neutral-200 pt-7">
          <h2 className="text-2xl font-semibold">O que estamos testando?</h2>
          <p className="mt-4 leading-8">A notificação chega na conversa do Fora da Pauta, abre um artigo para leitura e permite retornar ao Telegram, onde ficam as outras opções de navegação.</p>
          <p className="mt-4 leading-8">Este texto é apenas uma demonstração. Não é uma reportagem nem uma edição editorial para compartilhar.</p>
        </section>
        <div className="mt-12 border border-neutral-200 bg-neutral-50 p-5">
          <p className="font-semibold">Terminou de ler?</p>
          <p className="mt-2 text-sm leading-6 text-neutral-600">Volte para o bot e escolha outra opção na mensagem de teste. Dependendo do aparelho, será preciso fechar a página para reencontrar a notificação.</p>
          <a href="https://t.me/ForaDaPautaAcompanhaBot?start=opcoes" className="mt-5 inline-flex min-h-12 items-center justify-center bg-[#FFD700] px-5 py-3 font-semibold text-black">
            Voltar ao Telegram
          </a>
        </div>
        <p className="mt-6 text-xs text-neutral-500">Teste privado por comando do bot · <Link href="/" className="underline">Página inicial</Link></p>
      </div>
    </main>
  );
}
