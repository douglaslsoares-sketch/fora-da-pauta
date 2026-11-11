import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "QR Code | Fora da Pauta",
  description: "Mostre o QR Code do Fora da Pauta para outras pessoas acessarem o site.",
};

export default function PaginaQRCode() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="mx-auto max-w-2xl px-5 pb-14 pt-10 text-center">
        <p className="mx-auto max-w-lg text-base leading-relaxed text-black/70">
          Aponte a câmera do celular.
        </p>
        <div className="mx-auto mt-8 w-full max-w-[340px] rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <Image src="/qr/fora-da-pauta.svg" alt="QR Code para acessar foradapauta.org" width={370} height={370} className="h-auto w-full" unoptimized priority />
        </div>
        <p className="mt-5 text-lg font-semibold">foradapauta.org</p>
        <div className="mt-10 flex justify-center">
          <Link href="/central" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-7 py-3 text-center font-semibold text-white hover:bg-red-700">
            <span aria-hidden="true" className="text-xl leading-none">×</span> Fechar
          </Link>
        </div>
      </section>
    </main>
  );
}
