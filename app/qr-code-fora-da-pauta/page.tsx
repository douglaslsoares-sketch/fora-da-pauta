"use client";
import Image from "next/image";
import { useEffect } from "react";

export default function Page(){
  useEffect(() => {
    // Não reutilizar a posição de rolagem da página anterior.
    window.scrollTo({top:0,left:0,behavior:"instant"});
  },[]);
  return <main className="min-h-screen bg-white px-5 pb-16 pt-10 text-black">
    <div className="mx-auto max-w-xl text-center">
      <h1 className="text-3xl font-extrabold leading-tight">QR Code do Fora da Pauta</h1>
      <p className="mt-6 text-xl">Aponte a câmera.</p>
      <Image src="/qr/fora-da-pauta.svg" alt="QR Code do Fora da Pauta" width={280} height={280} className="mx-auto mt-7 h-auto max-w-full" />
      <p className="mt-4 font-bold">foradapauta.org</p>
    </div>
  </main>;
}
