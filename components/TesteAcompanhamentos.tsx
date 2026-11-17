"use client";

import { useEffect, useState } from "react";

export function TesteAcompanhamentos() {
  const [ids, setIds] = useState<string[]>([]);
  const [id, setId] = useState("");
  const [aviso, setAviso] = useState("Consultando...");
  async function consultar() {
    try {
      const r = await fetch("/api/site/acompanhamentos", { cache: "no-store" });
      const data = await r.json() as { ids?: string[]; erro?: string };
      if (!r.ok) throw Error(data.erro || "Falha na consulta");
      setIds(Array.isArray(data.ids) ? data.ids : []);
      setAviso("Consulta concluída.");
    } catch (error) {
      setAviso(error instanceof Error ? error.message : "Falha na consulta.");
    }
  }
  useEffect(() => { void consultar(); }, []);
  async function alterar(method: "POST" | "DELETE", candidatura: string) {
    setAviso("Salvando...");
    try {
      const r = await fetch("/api/site/acompanhamentos", {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: candidatura }),
      });
      const data = await r.json() as { erro?: string };
      if (!r.ok) throw Error(data.erro || "Falha ao salvar");
      await consultar();
    } catch (error) {
      setAviso(error instanceof Error ? error.message : "Falha ao salvar.");
    }
  }
  return <main style={{ maxWidth: 620, margin: "2rem auto", padding: 20 }}>
    <h1>Teste interno de acompanhamento</h1>
    <p>Esta página não faz parte do menu público. Utilize apenas candidaturas de teste.</p>
    <p role="status">{aviso}</p>
    <label htmlFor="id-candidatura">ID da candidatura</label>
    <input id="id-candidatura" value={id} onChange={e => setId(e.target.value)}
      inputMode="numeric" style={{ display: "block", padding: 12, width: "100%", margin: "10px 0" }} />
    <button onClick={() => void alterar("POST", id)}>Adicionar</button>{" "}
    <button onClick={() => void consultar()}>Atualizar lista</button>
    <ul>{ids.map(item => <li key={item}>{item}{" "}
      <button onClick={() => void alterar("DELETE", item)}>Remover</button></li>)}</ul>
  </main>;
}
