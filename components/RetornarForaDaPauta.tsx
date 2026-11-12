import Link from "next/link";

/** Ícone universal de fechar: sempre retorna à home e respeita a sessão Telegram. */
export function FecharPaginaLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Fechar e voltar ao início"
      title="Fechar e voltar ao início"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-7 py-3 font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${className}`}
    >
      <span aria-hidden="true" className="text-xl leading-none">×</span>
      <span>Fechar</span>
    </Link>
  );
}
