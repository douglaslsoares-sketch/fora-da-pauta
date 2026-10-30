import type { Metadata } from "next";
import { VotouFiqueDeOlhoExperience } from "@/components/VotouFiqueDeOlhoExperience";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Fique de Olho",
  description: "Escolha quem você quer acompanhar no Fora da Pauta.",
  robots: { index: false, follow: false },
};

export default function VotouFiqueDeOlhoPage() {
  return (
    <div className={styles.page}>
      <main>
        <VotouFiqueDeOlhoExperience />
      </main>
    </div>
  );
}
