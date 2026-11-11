import Image from "next/image";
import Link from "next/link";
import { InstalarAplicativo } from "@/components/InstalarAplicativo";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Central | EU VIGIO",
  description: "Escolha políticos para acompanhar e encontre as opções do EU VIGIO.",
};

const compartilhar = "https://wa.me/?text=" + encodeURIComponent(
  "Conheça o EU VIGIO. Acompanhe o dia a dia dos políticos. https://foradapauta.org"
);

export default function Central() {
  return (
    <main className={styles.pagina}>
      <header className={styles.cabecalho} aria-label="Central EU VIGIO">
        <div className={styles.olho}>
          <Image src="/marca/eu-vigio-original.svg" alt="Olho realista de íris dourada, símbolo do EU VIGIO" width={660} height={440} priority unoptimized />
        </div>
      </header>
      <nav className={styles.menu} aria-label="Menu central">
        <Link className={styles.principal} href="/acompanhar">Escolher um político</Link>
        <Link className={styles.botao} href="/votou-fique-de-olho?minhas=1">Políticos que eu acompanho</Link>
        <Link className={styles.botao} href="/votou-fique-de-olho">Mandar um recado</Link>
        <Link className={styles.botao} href="/edicoes">Entender Melhor</Link>
        <Link className={styles.botao} href="/camiseta">Camiseta</Link>
        <Link className={styles.botao} href="/qr/fora-da-pauta.svg">QR Code</Link>
        <a className={styles.compartilhar} href={compartilhar} target="_blank" rel="noopener noreferrer">Compartilhar</a>
        <InstalarAplicativo tema="escuro" />
      </nav>
    </main>
  );
}
