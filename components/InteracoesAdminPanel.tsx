"use client";

import { useEffect, useState } from "react";

type Registro = {
  id: string;
  candidatura_id: string;
  categoria: string;
  mensagem: string;
  status: string;
  destino_oficial: string | null;
  destino_fonte_url: string | null;
  resposta_texto: string | null;
  notificacao_status: string;
  created_at: string;
};

export function InteracoesAdminPanel() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [erro, setErro] = useState("");
  const [senha, setSenha] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [id, setId] = useState("");
  const [status, setStatus] = useState("em_analise");
  const [destinoOficial, setDestinoOficial] = useState("");
  const [fonteOficial, setFonteOficial] = useState("");
  const [respostaTexto, setRespostaTexto] = useState("");
  const [autoria, setAutoria] = useState("assessoria");
  const [origemResposta, setOrigemResposta] = useState("");
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    const r = await fetch("/api/admin/interacoes", { cache: "no-store" });
    if (r.status === 401) { setAutenticado(false); return; }
    if (!r.ok) throw Error("Não foi possível carregar as manifestações.");
    const dados = await r.json() as { registros: Registro[] };
    setRegistros(dados.registros);
    setAutenticado(true);
  }
  useEffect(() => { void carregar().catch(() => setErro("Falha ao consultar manifestações.")); }, []);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const r = await fetch("/api/admin/perguntas/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessCode: senha }),
    });
    setSenha("");
    if (!r.ok) { setErro("Acesso não autorizado."); return; }
    await carregar();
  }
  async function atualizar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true); setErro("");
    try {
      const r = await fetch("/api/admin/interacoes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id, status, destinoOficial, fonteOficial,
          respostaTexto, autoria, origemResposta, observacao,
        }),
      });
      const result = await r.json() as { erro?: string };
      if (!r.ok) throw Error(result.erro || "Não foi possível atualizar.");
      await carregar();
      setId(""); setObservacao(""); setRespostaTexto("");
    } catch (e) { setErro(e instanceof Error ? e.message : "Falha ao atualizar."); }
    finally { setSalvando(false); }
  }

  if (!autenticado) return (
    <form onSubmit={entrar} className="mt-8 space-y-3">
      <label className="block font-semibold" htmlFor="acesso-interacoes">Acesso administrativo</label>
      <input id="acesso-interacoes" type="password" required value={senha}
        onChange={e => setSenha(e.target.value)}
        className="w-full border border-black/20 bg-white p-3" />
      <button className="bg-black px-5 py-3 font-semibold text-white">Entrar</button>
      {erro ? <p role="alert" className="text-red-700">{erro}</p> : null}
    </form>
  );
  return <div className="mt-8 space-y-6">
    <p className="text-sm text-black/60">
      Registre o encaminhamento somente depois de realizá-lo por um canal oficial verificado.
      Nunca registre uma resposta sem conferir a autoria.
    </p>
    <div className="space-y-4">
      {registros.map(r => <article key={r.id} className="border border-black/20 bg-white p-4">
        <p className="break-all text-xs text-black/50">Protocolo: {r.id}</p>
        <p className="mt-1 text-sm">Candidatura: {r.candidatura_id} | Tipo: {r.categoria}</p>
        <p className="mt-2 whitespace-pre-wrap">{r.mensagem}</p>
        <p className="mt-2 text-sm font-semibold">Situação: {r.status}</p>
        <p className="text-xs text-black/60">Notificação: {r.notificacao_status}</p>
        <button type="button" onClick={() => {
          setId(r.id); setDestinoOficial(r.destino_oficial || "");
          setFonteOficial(r.destino_fonte_url || "");
          setStatus(r.status === "recebida" ? "em_analise" :
            r.status === "em_analise" ? "encaminhada" :
            r.status === "encaminhada" ? "respondida" : "em_analise");
        }} className="mt-2 border border-black/30 px-3 py-2 text-sm font-semibold">
          Gerenciar
        </button>
      </article>)}
      {!registros.length ? <p>Nenhuma manifestação recebida.</p> : null}
    </div>
    {id ? <form onSubmit={atualizar} className="space-y-3 border-t border-black/20 pt-5">
      <h2 className="text-xl font-bold">Atualizar manifestação</h2>
      <p className="break-all text-xs">{id}</p>
      <select value={status} onChange={e=>setStatus(e.target.value)}
        className="w-full border p-3">
        <option value="em_analise">Em análise</option>
        <option value="encaminhada">Encaminhada — já enviada ao destinatário</option>
        <option value="respondida">Respondida — origem verificada</option>
        <option value="sem_resposta">Sem resposta</option>
        <option value="nao_encaminhada">Não encaminhada</option>
      </select>
      <label className="block text-sm">Canal oficial utilizado
        <input value={destinoOficial} onChange={e=>setDestinoOficial(e.target.value)}
          className="mt-1 w-full border p-3" maxLength={250} />
      </label>
      <label className="block text-sm">Fonte pública do contato (URL HTTPS)
        <input value={fonteOficial} onChange={e=>setFonteOficial(e.target.value)}
          className="mt-1 w-full border p-3" maxLength={500} />
      </label>
      {status === "respondida" ? <>
        <label className="block text-sm">Resposta recebida
          <textarea value={respostaTexto} onChange={e=>setRespostaTexto(e.target.value)}
            rows={6} className="mt-1 w-full border p-3" maxLength={2400} />
        </label>
        <label className="block text-sm">Autoria
          <select value={autoria} onChange={e=>setAutoria(e.target.value)} className="mt-1 w-full border p-3">
            <option value="titular">A própria pessoa pública</option>
            <option value="assessoria">Assessoria</option>
            <option value="orgao">Órgão público</option>
          </select>
        </label>
        <label className="block text-sm">Como a origem foi verificada
          <textarea value={origemResposta} onChange={e=>setOrigemResposta(e.target.value)}
            rows={3} maxLength={500} className="mt-1 w-full border p-3" />
        </label>
      </> : null}
      <label className="block text-sm">Observação interna
        <textarea value={observacao} onChange={e=>setObservacao(e.target.value)}
          maxLength={500} className="mt-1 w-full border p-3" />
      </label>
      <button disabled={salvando} className="bg-black px-5 py-3 text-white disabled:opacity-50">
        {salvando ? "Salvando..." : "Confirmar registro"}
      </button>
    </form> : null}
    {erro ? <p role="alert" className="text-red-700">{erro}</p> : null}
  </div>;
}
