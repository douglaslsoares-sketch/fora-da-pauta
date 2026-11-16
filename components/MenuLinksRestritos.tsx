"use client";

import Link from "next/link";
import { useState } from "react";
import { InscricaoNecessariaModal } from "@/components/InscricaoNecessariaModal";
import styles from "@/app/central/page.module.css";

export function MenuLinksRestritos({ inscrito, avisoInicial }: { inscrito: boolean; avisoInicial: boolean }) {
  const [avisoAberto, setAvisoAberto] = useState(!inscrito && avisoInicial);
  return (
    <>
      {inscrito ? (
        <Link className={styles.botao} href="/votou-fique-de-olho?minhas=1">Políticos que eu acompanho</Link>
      ) : (
        <button type="button" className={styles.botaoRestrito} onClick={() => setAvisoAberto(true)}>
          Políticos que eu acompanho
        </button>
      )}
      {inscrito ? (
        <Link className={styles.botao} href="/fazer-uma-pergunta">O que você gostaria de perguntar?</Link>
      ) : (
        <button type="button" className={styles.botaoRestrito} onClick={() => setAvisoAberto(true)}>
          O que você gostaria de perguntar?
        </button>
      )}
      <InscricaoNecessariaModal aberta={avisoAberto} onFechar={() => setAvisoAberto(false)} contexto="secao" />
    </>
  );
}
