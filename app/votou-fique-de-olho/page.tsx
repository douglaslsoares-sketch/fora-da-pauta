import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link
            href="/"
            aria-label="Fora da Pauta — página inicial"
            className={styles.brandLink}
          >
            <Image
              src="/icon.png"
              alt="Fora da Pauta"
              width={48}
              height={48}
              priority
              className={styles.logo}
            />
          </Link>

          <p className={styles.tagline}>
            há mais para entender.
          </p>
        </div>
      </header>

      <main>
        <VotouFiqueDeOlhoExperience />
      </main>
    </div>
  );
}
