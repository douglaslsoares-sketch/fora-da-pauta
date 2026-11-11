import { HomeAcessoTelegram } from "@/components/HomeAcessoTelegram";
import { versaoEdicoes, versaoEntregas } from "@/lib/novidades-publicacoes";
import type { Metadata } from "next";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Acompanhar | EU VIGIO" };

export default function Acompanhar() {
  return <main className={styles.page}><HomeAcessoTelegram pagina="opcoes" versaoEdicoes={versaoEdicoes} versaoEntregas={versaoEntregas} /></main>;
}
