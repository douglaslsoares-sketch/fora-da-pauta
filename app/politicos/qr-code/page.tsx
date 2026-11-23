import type { Metadata } from "next";
import { PaginaPoliticos } from "@/components/PaginaPoliticos";
export const metadata: Metadata = { title: "QR Code | Políticos" };
export default function QRCodePoliticos() {
  return <PaginaPoliticos titulo="Mostrar QR Code">
    <p className="mb-5 text-center text-lg text-slate-200">Aponte a câmera do celular para abrir o aplicativo Políticos.</p>
    <div className="mx-auto max-w-[330px] rounded-2xl bg-white p-5">
      <img src="/qr/politicos.svg" width={370} height={370} alt="QR Code para foradapauta.org/politicos" className="h-auto w-full" />
    </div>
    <p className="mt-5 break-all text-center font-semibold text-[#ffd432]">foradapauta.org/politicos</p>
  </PaginaPoliticos>;
}
