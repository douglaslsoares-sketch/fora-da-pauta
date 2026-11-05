import Link from "next/link";

/** Fecha a ficha e abre a home, que mostra a área correta conforme a sessão Telegram. */
export function FecharFichaLink() {
  return (
    <Link
      href="/"
      aria-label="Fechar ficha e ir para o início"
      className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
    >
      Fechar
    </Link>
  );
}
