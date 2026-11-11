import type { Metadata } from "next";
import { NovaHomeFiqueDeOlho } from "@/components/NovaHomeFiqueDeOlho";

export const metadata: Metadata = {
  title: "Conferir home | Fique de Olho",
  robots: { index: false, follow: false },
};

export default function ConferirHome() {
  return (
    <main className="min-h-svh bg-black text-white">
      <NovaHomeFiqueDeOlho />
    </main>
  );
}
