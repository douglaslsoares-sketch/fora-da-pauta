import Link from "next/link";

/** Único acesso à home, para visitantes e pessoas inscritas. */
export function RetornarForaDaPauta() {
  return (
    <Link
      href="/"
      aria-label="Abrir foradapauta.org"
      className="mx-auto mt-7 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-black px-5 py-3 text-center text-base font-semibold text-white transition hover:bg-black/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
    >
      <span aria-hidden="true" className="text-xl">→</span>
      <span>foradapauta.org</span>
    </Link>
  );
}
