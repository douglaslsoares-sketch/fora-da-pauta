import Link from "next/link";

/** Retorno padronizado: somente o endereço do site é clicável. */
export function RetornarForaDaPauta() {
  return (
    <div className="mx-auto mt-7 flex w-full flex-col items-center gap-2">
      <p className="text-center text-sm font-medium text-black/65">Retornar</p>
      <Link
        href="/"
        className="flex min-h-14 w-full items-center justify-center rounded-xl bg-black px-5 py-3 text-center text-base font-semibold text-white hover:bg-black/85"
      >
        foradapauta.org
      </Link>
    </div>
  );
}
