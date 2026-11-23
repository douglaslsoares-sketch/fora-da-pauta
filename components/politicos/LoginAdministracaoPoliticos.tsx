"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
export function LoginAdministracaoPoliticos() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!codigo.trim() || enviando) return;
    setEnviando(true); setErro("");
    try {
      const r = await fetch("/api/admin/perguntas/login", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ accessCode: codigo.trim() })
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({})) as { error?: string };
        throw Error(d.error || "Acesso não autorizado.");
      }
      setCodigo("");
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha na autenticação.");
    } finally {
      setEnviando(false);
    }
  }
  return <main className="min-h-screen bg-[#071827] px-5 py-12 text-white">
    <section className="mx-auto max-w-md rounded-2xl border border-[#344760] bg-[#152d45] p-6">
      <h1 className="text-2xl font-bold text-[#ffd02a]">Administração · Políticos</h1>
      <p className="mt-3 text-sm leading-6 text-slate-300">Use o código administrativo já salvo no seu gerenciador de senhas. Não compartilhe esse código.</p>
      <form onSubmit={entrar} className="mt-6">
        <label htmlFor="politicos-admin-codigo" className="font-semibold">Código de acesso</label>
        <input id="politicos-admin-codigo" type="password" required autoComplete="off" value={codigo} onChange={e=>setCodigo(e.target.value)} className="mt-2 block min-h-12 w-full rounded-lg bg-white px-4 py-3 text-black"/>
        {erro && <p role="alert" className="mt-3 text-sm text-red-200">{erro}</p>}
        <button type="submit" disabled={enviando} className="mt-5 min-h-12 w-full rounded-lg bg-[#ffd02a] px-5 py-3 font-bold text-[#091e30] disabled:opacity-50">{enviando ? "Verificando..." : "Entrar"}</button>
      </form>
    </section>
  </main>;
}
