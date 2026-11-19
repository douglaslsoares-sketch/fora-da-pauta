"use client";

import { useEffect, useState } from "react";

type Recado = { id: string; destinatario: "projeto" | "comunidade"; texto: string; status: string; criado_em: string; resposta_publicada: string | null; resposta_publicada_em: string | null };
const estados: Record<string, string> = { recebido: "Recebido", em_analise: "Em análise", respondido: "Respondido", arquivado: "Arquivado" };

export function HistoricoRecados() {
  const [recados, setRecados] = useState<Recado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atualizando, setAtualizando] = useState(false);
  const [avisoAtualizacao, setAvisoAtualizacao] = useState("");
  const [codigoGerado, setCodigoGerado] = useState("");
  const [codigoInformado, setCodigoInformado] = useState("");
  const [vinculando, setVinculando] = useState(false);
  const [mensagemVinculo, setMensagemVinculo] = useState("");
  const [chaveRecuperacao, setChaveRecuperacao] = useState("");
  const [chaveInformada, setChaveInformada] = useState("");
  const [recuperando, setRecuperando] = useState(false);
  const [mensagemRecuperacao, setMensagemRecuperacao] = useState("");
  async function consultarRecados(silencioso = false) {
    if (!silencioso) setAtualizando(true);
    try {
      const resposta = await fetch("/api/recados", { credentials: "same-origin", cache: "no-store" });
      if (!resposta.ok) throw Error("Não foi possível consultar seus recados.");
      const dados = await resposta.json() as { recados?: Recado[] };
      const lista = Array.isArray(dados.recados) ? dados.recados : [];
      setRecados(lista);
      setErro("");
      if (!silencioso) setAvisoAtualizacao("Histórico atualizado. " + (lista.filter(item => item.resposta_publicada).length || "Nenhuma") + " resposta(s) disponível(is).");
    } catch {
      if (!silencioso) setAvisoAtualizacao("");
      setErro("Não foi possível atualizar o histórico. Tente novamente.");
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }
  useEffect(() => {
    void consultarRecados(true);
    const aoRetornar = () => { if (document.visibilityState === "visible") void consultarRecados(true); };
    document.addEventListener("visibilitychange", aoRetornar);
    return () => document.removeEventListener("visibilitychange", aoRetornar);
  }, []);
  const atualizar = <div className="mt-5 flex flex-wrap items-center justify-center gap-3"><button type="button" disabled={atualizando} onClick={() => void consultarRecados()} className="rounded-lg border border-yellow-400 px-4 py-2 text-sm font-semibold text-yellow-200 disabled:opacity-50">{atualizando ? "Atualizando..." : "Verificar novas respostas"}</button>{avisoAtualizacao && <p role="status" className="text-sm text-slate-200">{avisoAtualizacao}</p>}</div>;
  async function vincular(modo: "criar" | "usar") {
    setVinculando(true); setMensagemVinculo("");
    try {
      const resposta = await fetch("/api/recados/vincular", { method: modo === "criar" ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: modo === "usar" ? JSON.stringify({ codigo: codigoInformado }) : "{}" });
      const dados = await resposta.json() as { erro?: string; codigo?: string };
      if (!resposta.ok) throw new Error(dados.erro || "Não foi possível vincular.");
      if (modo === "criar") { setCodigoGerado(dados.codigo || ""); setMensagemVinculo("Código válido por 10 minutos e utilizável uma única vez."); }
      else { setMensagemVinculo("Histórico vinculado. Atualizando recados..."); window.location.reload(); }
    } catch (erro) { setMensagemVinculo(erro instanceof Error ? erro.message : "Falha ao vincular."); }
    finally { setVinculando(false); }
  }
  async function recuperar(modo: "criar" | "usar") {
    if (recuperando) return;
    setRecuperando(true); setMensagemRecuperacao("");
    try {
      const resposta = await fetch("/api/recados/recuperar", {
        method: modo === "criar" ? "POST" : "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: modo === "criar" ? "{}" : JSON.stringify({ chave: chaveInformada }),
      });
      const dados = await resposta.json() as { chave?: string; erro?: string };
      if (!resposta.ok) throw new Error(dados.erro || "Não foi possível concluir.");
      if (modo === "criar") {
        setChaveRecuperacao(dados.chave || "");
        setMensagemRecuperacao("Guarde esta chave em local privado. Gerar outra invalida a anterior.");
      } else {
        setMensagemRecuperacao("Histórico recuperado. Atualizando...");
        window.location.reload();
      }
    } catch (erro) {
      setMensagemRecuperacao(erro instanceof Error ? erro.message : "Falha na recuperação.");
    } finally { setRecuperando(false); }
  }
  const painelRecuperacao = <details className="mt-4 rounded-xl border border-[#344760] bg-[#24334b] p-5">
    <summary className="cursor-pointer font-semibold text-yellow-200">Recuperar meus recados (opcional)</summary>
    <p className="mt-3 text-sm leading-6 text-slate-300">Se perder o acesso aos aparelhos, uma chave privada permite recuperar seus recados. Quem tiver essa chave poderá ler suas mensagens. Guarde-a com segurança e não a compartilhe.</p>
    {recados.length > 0 && <div className="mt-4">
      <button type="button" disabled={recuperando} onClick={() => void recuperar("criar")} className="rounded-lg bg-yellow-400 px-4 py-2 font-bold text-[#152238] disabled:opacity-50">Gerar chave de recuperação</button>
      {chaveRecuperacao && <div className="mt-3 rounded-lg bg-[#152238] p-3"><p className="text-xs text-slate-300">A chave aparece somente agora. Salve em seu gerenciador de senhas.</p><p className="mt-2 break-all font-mono text-sm text-yellow-200">{chaveRecuperacao}</p><button type="button" className="mt-3 rounded-lg border border-yellow-400 px-3 py-2 text-sm text-yellow-200" onClick={() => { void navigator.clipboard.writeText(chaveRecuperacao).then(() => setMensagemRecuperacao("Chave copiada. Guarde-a em local privado."), () => setMensagemRecuperacao("Selecione e copie a chave manualmente.")); }}>Copiar chave</button></div>}
    </div>}
    <label htmlFor="chave-recuperacao" className="mt-5 block text-sm font-semibold">Já tenho uma chave de recuperação</label>
    <textarea id="chave-recuperacao" value={chaveInformada} onChange={evento => setChaveInformada(evento.target.value)} autoComplete="off" spellCheck={false} rows={2} placeholder="Cole sua chave privada" className="mt-2 w-full rounded-lg border border-[#536784] bg-[#152238] px-3 py-3 font-mono text-white" />
    <button type="button" disabled={recuperando || !chaveInformada.trim()} onClick={() => { if (recados.length > 0 && !window.confirm("Recuperar outro histórico substituirá o acesso atual neste aparelho. Continuar?")) return; void recuperar("usar"); }} className="mt-3 rounded-lg border border-yellow-400 px-4 py-2 font-semibold text-yellow-200 disabled:opacity-50">Recuperar histórico</button>
    {mensagemRecuperacao && <p role="status" className="mt-3 text-sm text-slate-200">{mensagemRecuperacao}</p>}
  </details>;
  const painelVinculo = <details className="mt-8 rounded-xl border border-[#344760] bg-[#24334b] p-5"><summary className="cursor-pointer font-semibold text-yellow-200">Usar meus recados em outro aparelho (opcional)</summary><div className="mt-4">
    <h2 className="font-bold">Acessar o histórico em outro aparelho</h2>
    <p className="mt-2 text-sm leading-6 text-slate-300">Para acessar este histórico no celular ou computador, gere um código no navegador onde seus recados aparecem. Depois informe esse código no outro aparelho. Esse procedimento é opcional e não tem relação com o canal do WhatsApp. Não compartilhe o código com terceiros.</p>
    {recados.length > 0 && <div className="mt-4"><button type="button" disabled={vinculando} onClick={() => void vincular("criar")} className="rounded-lg bg-yellow-400 px-4 py-2 font-bold text-[#152238] disabled:opacity-50">Gerar código de vínculo</button>{codigoGerado && <p className="mt-3 break-all rounded-lg bg-[#152238] p-3 font-mono text-lg tracking-wider text-yellow-200" aria-label="Código de vínculo">{codigoGerado}</p>}</div>}
    <label htmlFor="codigo-vinculo" className="mt-5 block text-sm font-semibold">Código gerado no outro aparelho</label>
    <input id="codigo-vinculo" value={codigoInformado} onChange={evento => setCodigoInformado(evento.target.value)} autoComplete="off" spellCheck={false} maxLength={32} placeholder="Cole o código aqui" className="mt-2 w-full rounded-lg border border-[#536784] bg-[#152238] px-3 py-3 font-mono text-white" />
    <button type="button" disabled={vinculando || !codigoInformado.trim()} onClick={() => { if (recados.length && !window.confirm("Este navegador já possui recados. Vincular outro histórico substituirá o acesso atual neste navegador. Continuar?")) return; void vincular("usar"); }} className="mt-3 rounded-lg border border-yellow-400 px-4 py-2 font-semibold text-yellow-200 disabled:opacity-50">Vincular histórico</button>
    {mensagemVinculo && <p role="status" className="mt-3 text-sm text-slate-200">{mensagemVinculo}</p>}
  </div></details>;
  if (carregando) return <p role="status" className="mt-8 text-center text-slate-300">Carregando recados...</p>;
  if (erro) return <div><p role="alert" className="mt-8 text-center text-red-200">{erro}</p>{atualizar}</div>;
  if (!recados.length) return <><div className="mt-8 rounded-xl border border-[#344760] bg-[#24334b] p-6 text-center"><p>Você ainda não tem recados neste aparelho.</p><a href="/mandar-recado" className="mt-4 inline-block font-semibold text-yellow-300 underline">Mandar um recado</a></div>{atualizar}{painelVinculo}{painelRecuperacao}</>;
  return <div className="mt-8 space-y-3">{recados.map(recado => <article key={recado.id} className="rounded-xl border border-[#344760] bg-[#24334b] p-5">
    <div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-bold">{recado.destinatario === "projeto" ? "Para o Fora da Pauta" : "Para a comunidade"}</h2><span className="rounded-md bg-[#334e71] px-2 py-1 text-xs text-yellow-200">{estados[recado.status] ?? recado.status}</span></div>
    <p className="mt-2 text-xs text-slate-300">{new Date(recado.criado_em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</p>
    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">{recado.texto}</p>
    <p className="mt-3 text-xs text-slate-300">Protocolo: <span className="break-all">{recado.id}</span></p>
    {recado.resposta_publicada ? <div className="mt-4 rounded-lg border border-yellow-400/30 bg-[#1b2a42] p-4"><p className="font-bold text-yellow-200">Resposta do Fora da Pauta</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{recado.resposta_publicada}</p>{recado.resposta_publicada_em && <p className="mt-3 text-xs text-slate-300">Disponibilizada em {new Date(recado.resposta_publicada_em).toLocaleString("pt-BR")}</p>}</div> : recado.status === "respondido" ? <p className="mt-3 text-xs text-yellow-200">Recado marcado como respondido. Nenhuma resposta foi disponibilizada aqui.</p> : null}
  </article>)}{atualizar}{painelVinculo}{painelRecuperacao}</div>;
}
