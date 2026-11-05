import Link from "next/link";

/** Ícone universal de fechar: sempre retorna à home e respeita a sessão Telegram. */
export function FecharPaginaLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Fechar e voltar ao início"
      title="Fechar e voltar ao início"
      className={`inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border border-black/20 bg-white text-black transition hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${className}`}
    >
      <span aria-hidden="true" className="text-[28px] font-normal leading-none">×</span>
      <span className="sr-only">Fechar</span>
    </Link>
  );
}
