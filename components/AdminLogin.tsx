"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pin.trim() || enviando) return;
    setEnviando(true);
    setErro("");
    try {
      const resposta = await fetch("/api/admin/perguntas/login", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ accessCode: pin.trim() }),
      });
      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({})) as { error?: string };
        throw new Error(dados.error || "PIN incorreto ou acesso não autorizado.");
      }
      setPin("");
      router.refresh();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível autenticar.");
    } finally { setEnviando(false); }
  }

  return <main className="min-h-[75vh] bg-[#eeeee9] px-8 py-16 text-[#151515]">
    <section className="mx-auto max-w-lg rounded-2xl border border-black/10 bg-white p-9 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-black/50">Área restrita · Desktop</p>
      <h1 className="mt-3 text-3xl font-bold">Administração</h1>
      <p className="mt-3 text-sm leading-6 text-black/60">Digite seu PIN administrativo para acessar o painel do Fora da Pauta.</p>
      <form onSubmit={entrar} className="mt-8">
        <label htmlFor="admin-pin" className="block text-sm font-semibold">PIN de acesso</label>
        <input id="admin-pin" type="password" autoComplete="off" spellCheck={false} required value={pin} onChange={e => setPin(e.target.value)} placeholder="Digite ou cole seu PIN" className="mt-2 w-full rounded-lg border border-black/20 bg-[#f4f4f1] px-4 py-3 text-base focus:outline-2 focus:outline-[#315b92]" />
        {erro && <p role="alert" className="mt-4 text-sm text-red-700">{erro}</p>}
        <button type="submit" disabled={enviando} className="mt-5 w-full rounded-lg bg-[#152238] px-5 py-3 font-semibold text-white disabled:opacity-50">{enviando ? "Verificando..." : "Entrar no painel"}</button>
      </form>
      <p className="mt-5 text-xs text-black/50">Use o mesmo código administrativo já cadastrado. Não compartilhe seu PIN.</p>
    </section>
  </main>;
}
