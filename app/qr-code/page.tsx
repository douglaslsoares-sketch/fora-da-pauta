import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "QR Code | Fora da Pauta",
  description: "Mostre o QR Code do Fora da Pauta para outras pessoas acessarem o site.",
};

export default function PaginaQRCode() {
  return (
    <main className="min-h-[100dvh] bg-[#0E1A29] text-white">
      <section className="mx-auto max-w-xl px-5 pt-5 pb-10 text-center">
        <header className="flex flex-col items-center pb-5">
          <h1 className="text-center text-5xl font-extrabold tracking-tight sm:text-6xl">QR Code</h1>
        </header>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-300">
          Aponte a câmera do celular para acessar o Fora da Pauta.
        </p>
        <div className="mx-auto mt-6 w-full max-w-[300px] rounded-2xl bg-white p-4">
          <Image src="/qr/fora-da-pauta.svg" alt="QR Code para acessar foradapauta.org" width={370} height={370} className="h-auto w-full" unoptimized priority />
        </div>
        <Link href="/" className="mx-auto mt-7 block min-h-12 text-center font-semibold text-[#F4C64D] hover:underline underline-offset-4">← Fora da Pauta</Link>
      </section>
    </main>
  );
}
