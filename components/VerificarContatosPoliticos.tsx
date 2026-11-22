"use client";

import { useState } from "react";

type Candidato = { id: string; nomeUrna: string; nomeCompleto: string; cargo: string; cargoLabel: string; uf: string; siglaPartido: string; situacaoEleitoral?: string };
type Resultado = {
  situacao: "encontrado" | "pendente" | "indisponivel" | "nao_aplicavel";
  casa?: string; nomeOficial?: string; emailInstitucional?: string;
  fonteUrl?: string | null; conferencia?: string; motivo?: string;
  envioHabilitado: false;
};
type Diagnostico = { fontes: { nome: string; ok: boolean; mensagem: string; consultadaEm: string; tipo?: "api" | "pagina"; verificacaoManual?: boolean; canais?: { titulo: string; url: string }[] }[]; observacao: string };
type Revisao = { registro: { candidatura_id: string; nome_civil: string; instituicao: string; email_institucional: string; fonte_url: string; status: "revisado" | "revogado"; revisado_em: string; expira_em: string; revogado_em: string | null } | null; vigente: boolean; envioHabilitado: false; mensagem?: string };
type DominioResend = { dominio: string; situacao: string; statusResend?: string; dominioVerificadoNoResend?: boolean; mensagem: string; consultadoEm: string; envioHabilitado: false };
type Prontidao = { configuracaoTransporte?: { chaveResendConfigurada: boolean; remetenteConfigurado: boolean }; revisaoVigente: boolean; consultaFonteConcluida: boolean; contatoIgualAoAtual: boolean; credenciaisEnvioPresentes: boolean; prontoParaTesteDeTransporte: boolean; envioHabilitado: false; mensagem: string; consultadoEm: string };
type MandatoAtual = {
  cargo: "senador" | "deputado-federal" | "deputado-estadual";
  situacao: "confirmado" | "nao_confirmado" | "indisponivel" | "manual";
  instituicao: string; nomeOficial: string | null;
  emailInstitucional: string | null; fonteUrl: string | null; explicacao: string;
};
type MandatosAtuais = {
  verificacoes: MandatoAtual[]; consultadoEm: string; aviso: string;
  contatoAprovado: false; envioHabilitado: false;
};
type Consulta = { contextoMandato?: { titulo: string; explicacao: string; fontePosse: string; cargoAtual?: string; fonteCargoAtual?: string } | null; candidatura: { id: string; nomeUrna: string; nomeCompleto: string; uf: string; cargo: string }; resultado: Resultado; consultadoEm: string };

export default function VerificarContatosPoliticos() {
  const [nome, setNome] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [consultando, setConsultando] = useState("");
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [erro, setErro] = useState("");
  const [erroContato, setErroContato] = useState<{ id: string; mensagem: string } | null>(null);
  const [consultandoMandatos, setConsultandoMandatos] = useState("");
  const [mandatosAtuais, setMandatosAtuais] = useState<{ id: string; dados: MandatosAtuais } | null>(null);
  const [erroMandatosAtuais, setErroMandatosAtuais] = useState<{ id: string; mensagem: string } | null>(null);
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null);
  const [diagnosticando, setDiagnosticando] = useState(false);
  const [erroDiagnostico, setErroDiagnostico] = useState("");
  const [revisao, setRevisao] = useState<Revisao | null>(null);
  const [processandoRevisao, setProcessandoRevisao] = useState(false);
  const [avisoRevisao, setAvisoRevisao] = useState("");
  const [prontidao, setProntidao] = useState<Prontidao | null>(null);
  const [testandoProntidao, setTestandoProntidao] = useState(false);
  const [erroProntidao, setErroProntidao] = useState("");
  const [dominioResend, setDominioResend] = useState<DominioResend | null>(null);
  const [consultandoDominio, setConsultandoDominio] = useState(false);
  const [erroDominio, setErroDominio] = useState("");
  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    if (nome.trim().length < 2 || buscando) return;
    setBuscando(true); setBuscaRealizada(false); setErro(""); setErroContato(null); setMandatosAtuais(null); setErroMandatosAtuais(null); setCandidatos([]); setConsulta(null); setRevisao(null); setAvisoRevisao(""); setProntidao(null); setErroProntidao("");
    try {
      const r = await fetch("/api/candidatos/buscar?" + new URLSearchParams({ q: nome.trim(), pagina: "1", cargos: "deputado-federal,deputado-estadual,deputado-distrital,senador,presidente,governador" }), { cache: "no-store" });
      const data = await r.json() as { resultados?: Candidato[]; erro?: string };
      if (!r.ok) throw new Error(data.erro || "Busca indisponível.");
      setCandidatos((data.resultados || []).filter(p => p.cargo === "deputado-federal" || p.cargo === "deputado-estadual" || p.cargo === "deputado-distrital" || p.cargo === "senador" || p.cargo === "presidente" || p.cargo === "governador").slice(0, 30));
    } catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível buscar."); }
    finally { setBuscando(false); setBuscaRealizada(true); }
  }
  async function consultar(id: string) {
    if (consultando) return;
    setConsultando(id); setConsulta(null); setErroContato(null); setErro(""); setRevisao(null); setAvisoRevisao("");
    try {
      const r = await fetch("/api/admin/contatos-politicos?id=" + encodeURIComponent(id), { cache: "no-store" });
      const d = await r.json() as Consulta & { erro?: string };
      if (!r.ok) throw new Error(d.erro || "Consulta indisponível.");
      setConsulta(d);
      if (d.resultado.situacao === "encontrado") {
        try {
          const registro = await fetch("/api/admin/contatos-politicos/revisao?id=" + encodeURIComponent(id), { cache: "no-store" });
          if (registro.ok) setRevisao(await registro.json() as Revisao);
          else setAvisoRevisao("Não foi possível consultar as revisões anteriores. A aprovação ficará indisponível nesta consulta.");
        } catch { setAvisoRevisao("Histórico de revisões indisponível. Faça nova consulta antes de registrar uma aprovação."); }
      }
    } catch (e) { setErroContato({ id, mensagem: e instanceof Error ? e.message : "Não foi possível consultar." }); }
    finally { setConsultando(""); }
  }
  async function conferirMandatosAtuais(id: string) {
    if (consultandoMandatos) return;
    setConsultandoMandatos(id);
    setMandatosAtuais(null);
    setErroMandatosAtuais(null);
    try {
      const r = await fetch("/api/admin/contatos-politicos/mandatos-em-exercicio?id=" + encodeURIComponent(id),
        { cache: "no-store" });
      const dados = await r.json() as MandatosAtuais & { erro?: string };
      if (!r.ok) throw new Error(dados.erro || "Consulta aos mandatos atuais indisponível.");
      setMandatosAtuais({ id, dados });
    } catch (e) {
      setErroMandatosAtuais({ id, mensagem: e instanceof Error ? e.message : "Não foi possível consultar os mandatos atuais." });
    } finally {
      setConsultandoMandatos("");
    }
  }
  async function registrarRevisao(id: string, revogar: boolean) {
    if (processandoRevisao || !consulta || consulta.candidatura.id !== id) return;
    if (!revogar && (consulta.resultado.situacao !== "encontrado" ||
      !revisao)) return;
    if (revogar) {
      if (!window.confirm("Revogar esta revisão de contato? O histórico será preservado.")) return;
    } else {
      if (!window.confirm("Você conferiu pessoalmente o nome, o mandato em exercício e o e-mail na fonte oficial? Registrar a revisão não enviará mensagens.")) return;
    }
    setProcessandoRevisao(true); setAvisoRevisao("");
    try {
      const url = "/api/admin/contatos-politicos/revisao?id=" + encodeURIComponent(id);
      const resposta = await fetch(url, {
        method: revogar ? "DELETE" : "POST",
        headers: revogar ? undefined : { "Content-Type": "application/json" },
        body: revogar ? undefined : JSON.stringify({
          confirmacao: "REVISEI_NA_FONTE_OFICIAL",
          emailEsperado: consulta.resultado.situacao === "encontrado" ? consulta.resultado.emailInstitucional : "",
          fonteEsperada: consulta.resultado.fonteUrl
        })
      });
      const dados = await resposta.json() as Revisao & { erro?: string };
      if (!resposta.ok) throw new Error(dados.erro || "Não foi possível registrar a revisão.");
      setRevisao(dados);
      setProntidao(null);
      setAvisoRevisao(dados.mensagem || "Registro atualizado.");
    } catch (e) { setAvisoRevisao(e instanceof Error ? e.message : "Falha na revisão."); }
    finally { setProcessandoRevisao(false); }
  }
  async function testarProntidao(id: string) {
    if (testandoProntidao) return;
    setTestandoProntidao(true); setErroProntidao(""); setProntidao(null);
    try {
      const resposta = await fetch("/api/admin/contatos-politicos/prontidao?id=" + encodeURIComponent(id), { cache: "no-store" });
      const dados = await resposta.json() as Prontidao & { erro?: string };
      if (!resposta.ok) throw new Error(dados.erro || "Não foi possível testar a prontidão.");
      setProntidao(dados);
    } catch(e) { setErroProntidao(e instanceof Error ? e.message : "Falha no teste."); }
    finally { setTestandoProntidao(false); }
  }
  async function verificarDominioResend() {
    if (consultandoDominio) return;
    setConsultandoDominio(true); setDominioResend(null); setErroDominio("");
    try {
      const resposta = await fetch("/api/admin/contatos-politicos/dominio-resend", { cache: "no-store" });
      const dados = await resposta.json() as DominioResend & { erro?: string };
      if (!resposta.ok) throw new Error(dados.erro || dados.mensagem || "Não foi possível consultar o Resend.");
      setDominioResend(dados);
    } catch (erro) {
      setErroDominio(erro instanceof Error ? erro.message : "Não foi possível consultar o domínio.");
    } finally { setConsultandoDominio(false); }
  }
  async function verificarFontes() {
    if (diagnosticando) return;
    setDiagnosticando(true); setErroDiagnostico(""); setDiagnostico(null);
    try {
      const resposta = await fetch("/api/admin/contatos-politicos/diagnostico", { cache: "no-store" });
      const dados = await resposta.json() as Diagnostico & { erro?: string };
      if (!resposta.ok) throw new Error(dados.erro || "Não foi possível verificar as fontes.");
      setDiagnostico(dados);
    } catch (e) { setErroDiagnostico(e instanceof Error ? e.message : "Falha na verificação."); }
    finally { setDiagnosticando(false); }
  }
  return <section className="mt-6">
    <div className="mb-6 rounded-xl border border-black/10 bg-white p-5">
      <h2 className="text-lg font-bold">Verificar acesso às fontes oficiais</h2>
      <p className="mt-2 text-sm text-black/70">O diagnóstico consulta as bases da Câmara e do Senado e as orientações institucionais da Presidência da República. Não envia recados.</p>
      <button type="button" onClick={() => void verificarFontes()} disabled={diagnosticando} className="mt-3 rounded-lg bg-[#075cf0] px-5 py-3 font-semibold text-white disabled:opacity-50">{diagnosticando ? "Verificando fontes..." : "Verificar fontes oficiais"}</button>
      {erroDiagnostico && <p role="alert" className="mt-3 text-sm text-red-700">{erroDiagnostico}</p>}
      {diagnostico && <div role="status" className="mt-4 space-y-2">
        {diagnostico.fontes.map(fonte => <div key={fonte.nome} className="rounded-lg border border-slate-200 p-3 text-sm">
          <p className="font-semibold">{fonte.nome}: {fonte.verificacaoManual ? (fonte.ok ? "Orientações acessíveis — canal exige conferência manual" : "Conferência manual necessária") : fonte.ok ? "Conexão confirmada" : "Verificação não concluída"}</p>
          <p className="mt-1 text-black/70">{fonte.mensagem}</p>
          {fonte.canais && <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">{fonte.canais.map(canal => <a key={canal.url} href={canal.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 underline underline-offset-4">{canal.titulo}</a>)}</div>}
        </div>)}
        <p className="text-xs leading-5 text-black/60">{diagnostico.observacao}</p>
      </div>}
    </div>
    <div className="mb-6 rounded-xl border border-black/10 bg-white p-5">
      <h2 className="text-lg font-bold">Domínio de e-mail no Resend</h2>
      <p className="mt-2 text-sm text-black/70">Consulta o status de foradapauta.org diretamente no provedor, sem revelar chaves e sem enviar e-mails. Esta verificação é diferente da validação do domínio na Vercel.</p>
      <button type="button" onClick={() => void verificarDominioResend()} disabled={consultandoDominio}
        className="mt-3 rounded-lg border border-blue-700 px-5 py-3 font-semibold text-blue-800 disabled:opacity-50">
        {consultandoDominio ? "Consultando Resend..." : "Consultar domínio no Resend"}
      </button>
      {erroDominio && <p role="alert" className="mt-3 text-sm text-red-700">{erroDominio}</p>}
      {dominioResend && <div role="status" aria-live="polite" className="mt-4 rounded-lg border border-slate-200 p-4 text-sm">
        <p><strong>Domínio:</strong> {dominioResend.dominio}</p>
        <p className="mt-1"><strong>Situação:</strong> {dominioResend.situacao === "nao_configurado" ? "Chave Resend ausente neste ambiente" :
          dominioResend.situacao === "dominio_nao_encontrado" ? "Domínio não encontrado na conta consultada" :
          dominioResend.situacao === "encontrado" ? (dominioResend.statusResend === "verified" ? "Verificado no Resend" : "Resend: " + (dominioResend.statusResend || "status desconhecido")) :
          "Consulta inconclusiva (" + dominioResend.situacao + ")"}</p>
        <p className="mt-2 text-black/70">{dominioResend.mensagem}</p>
        <p className="mt-2 font-bold text-red-700">Envio bloqueado, mesmo que o domínio esteja verificado.</p>
        <p className="mt-1 text-xs text-black/55">Conferido em {new Date(dominioResend.consultadoEm).toLocaleString("pt-BR")}.</p>
      </div>}
    </div>
    <p className="text-sm leading-6 text-black/70">Busque um político e consulte as informações institucionais disponíveis. Para deputados e senadores, o sistema confronta dados com o cadastro de parlamentares em exercício. Para a Presidência, apresenta os canais oficiais de atendimento, que exigem conferência manual. A consulta é somente informativa: nenhum contato é aprovado ou mensagem enviada automaticamente.</p>
    <form onSubmit={e => void buscar(e)} className="mt-5 flex flex-wrap gap-3">
      <label className="min-w-56 flex-1 text-sm font-semibold">Nome do político
        <input value={nome} onChange={e => { setNome(e.target.value); setBuscaRealizada(false); }} className="mt-2 block w-full rounded-lg border border-slate-400 bg-white px-4 py-3 text-base text-black" placeholder="Digite o nome" minLength={2} required />
      </label>
      <button type="submit" disabled={buscando || nome.trim().length < 2} className="self-end rounded-lg bg-[#075cf0] px-6 py-3 font-semibold text-white disabled:opacity-50">{buscando ? "Buscando..." : "Buscar"}</button>
    </form>
    {erro && <p role="alert" className="mt-4 rounded-lg bg-red-100 p-3 text-red-900">{erro}</p>}
    {buscaRealizada && !buscando && !erro && candidatos.length === 0 && <p role="status" className="mt-4 rounded-lg border border-slate-300 bg-white p-4 text-sm">Nenhuma candidatura compatível foi encontrada na base eleitoral de 2026. Isso não comprova ausência de mandato em exercício ou de contato institucional.</p>}
    {candidatos.length > 0 && <div className="mt-5 space-y-2">
      <h2 className="text-lg font-bold">Candidaturas encontradas</h2>
      {candidatos.map(p => <div key={p.id} className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#344760] bg-[#24334b] p-4 text-white">
          <div><p className="font-bold">{p.nomeUrna}</p><p className="text-sm text-slate-200">{p.nomeCompleto} · {p.cargoLabel} · {p.uf} · {p.siglaPartido}</p></div>
          {p.cargo === "governador"
            ? <span className="rounded-lg border border-slate-400 px-4 py-2 text-sm font-semibold text-slate-100">Contato do governo não habilitado</span>
            : <button type="button" disabled={!!consultando} aria-expanded={consulta?.candidatura.id === p.id || consultando === p.id || erroContato?.id === p.id} aria-controls={"resultado-contato-" + p.id} onClick={() => void consultar(p.id)} className="rounded-lg bg-[#f4c542] px-4 py-2 font-semibold text-black disabled:opacity-50">{consultando === p.id ? "Consultando..." : "Conferir contato"}</button>}
        </div>
        {p.cargo === "governador" && <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-bold">{p.situacaoEleitoral || "Situação eleitoral de 2026 ainda não confirmada"}</p>
          <p className="mt-2">A eleição ao governo estadual não comprova posse nem exercício do novo mandato. A posse de governadores eleitos em 2026 está prevista para 6 de janeiro de 2027. Este painel não aprova nem envia recados para o governo estadual.</p>
          <p className="mt-2">O mandato anterior ou atual será verificado separadamente nas fontes institucionais; o novo cargo não é usado como prova de exercício.</p>
          <p className="mt-2 font-semibold">Nenhum contato foi autorizado e nenhuma mensagem foi enviada.</p>
        </div>}
        {p.cargo !== "presidente" && <div className="rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-900">
          <button type="button" onClick={() => void conferirMandatosAtuais(p.id)} disabled={!!consultandoMandatos}
            className="rounded-lg border border-blue-800 px-4 py-2 font-semibold text-blue-900 disabled:opacity-50">
            {consultandoMandatos === p.id ? "Verificando mandatos..." : "Verificar mandatos em exercício"}
          </button>
          {erroMandatosAtuais?.id === p.id && <p role="alert" className="mt-3 text-red-800">{erroMandatosAtuais.mensagem} Nenhum contato foi autorizado.</p>}
          {mandatosAtuais?.id === p.id && <div role="status" className="mt-3 space-y-3">
            {mandatosAtuais.dados.verificacoes.map(item => <div key={item.cargo} className="rounded-lg border border-slate-200 p-3">
              <p className="font-bold">{item.instituicao} — {item.situacao === "confirmado" ? "mandato em exercício confirmado" : item.situacao === "manual" ? "conferência manual necessária" : item.situacao === "indisponivel" ? "fonte indisponível" : "não confirmado na consulta"}</p>
              {item.nomeOficial && <p className="mt-1">Nome oficial: {item.nomeOficial}</p>}
              {item.emailInstitucional && <p className="mt-1 break-all">E-mail institucional: {item.emailInstitucional}</p>}
              <p className="mt-1">{item.explicacao}</p>
              {item.fonteUrl && <a href={item.fonteUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block font-semibold text-blue-800 underline">Consultar fonte oficial</a>}
            </div>)}
            <p className="text-xs">{mandatosAtuais.dados.aviso}</p>
            <p className="font-bold text-red-700">Nenhum contato foi autorizado; envio bloqueado.</p>
          </div>}
        </div>}
        {consultando === p.id && <div id={"resultado-contato-" + p.id} role="status" aria-live="polite" className="mt-2 rounded-xl border border-[#344760] bg-white p-5 text-sm text-slate-700">
          Consultando o cadastro oficial de {p.nomeUrna}...
        </div>}
        {erroContato?.id === p.id && <div id={"resultado-contato-" + p.id} role="alert" className="mt-2 rounded-xl border border-red-300 bg-red-50 p-5 text-sm text-red-900">
          <p className="font-semibold">Não foi possível concluir a conferência.</p>
          <p className="mt-2">{erroContato.mensagem}</p>
          <p className="mt-2">Nenhum contato foi aprovado e nenhuma mensagem foi enviada.</p>
        </div>}
        {consulta?.candidatura.id === p.id && <div role="status" id={"resultado-contato-" + p.id} className="mt-2 rounded-xl border border-[#344760] bg-white p-5">
      <h2 className="text-xl font-bold">Resultado da conferência</h2>
      <p className="mt-2 font-semibold">{consulta.candidatura.nomeUrna} — {consulta.candidatura.uf}</p>
      <p className="mt-3 text-sm">{consulta.resultado.situacao === "encontrado" ? "Possível contato institucional identificado, sujeito a revisão humana." : "Contato ainda não confirmado."}</p>
      {consulta.contextoMandato && <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm">
        <h3 className="font-bold text-amber-950">{consulta.contextoMandato.titulo}</h3>
        <p className="mt-2 leading-6 text-amber-950">{consulta.contextoMandato.explicacao}</p>
        <a href={consulta.contextoMandato.fontePosse} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold text-blue-800 underline">Fonte oficial sobre a posse</a>
        {consulta.contextoMandato.cargoAtual && <p className="mt-3 leading-6 text-amber-950">{consulta.contextoMandato.cargoAtual}</p>}
        {consulta.contextoMandato.fonteCargoAtual && <a href={consulta.contextoMandato.fonteCargoAtual} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold text-blue-800 underline">Consultar mandato estadual atual</a>}
      </div>}
      {consulta.resultado.situacao === "encontrado" ? <>
        <p className="mt-3 text-sm"><strong>Instituição:</strong> {consulta.resultado.casa}</p>
        <p className="mt-2 text-sm"><strong>Nome oficial:</strong> {consulta.resultado.nomeOficial}</p>
        <p className="mt-2 break-all text-sm"><strong>E-mail institucional:</strong> {consulta.resultado.emailInstitucional}</p>
        <p className="mt-3 text-sm">{consulta.resultado.conferencia}</p>
      </> : <p className="mt-3 text-sm">{consulta.resultado.motivo}</p>}
      {consulta.resultado.situacao === "encontrado" && <div className="mt-4 rounded-lg border border-slate-300 bg-slate-50 p-4 text-sm">
        <p className="font-bold">Revisão administrativa</p>
        {revisao?.registro && <p className="mt-2">Situação: {revisao.registro.status === "revogado" ? "Revogada" : revisao.vigente ? "Revisada — válida até " + new Date(revisao.registro.expira_em).toLocaleString("pt-BR") : "Revisão expirada"}</p>}
        {!revisao?.registro && <p className="mt-2">Contato ainda não revisado.</p>}
        <p className="mt-2 text-slate-700">Antes de registrar, confirme pessoalmente o nome civil, mandato e e-mail diretamente no site oficial. A validade é de sete dias. Nenhuma aprovação libera o envio de recados.</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" disabled={processandoRevisao || !revisao} onClick={() => void registrarRevisao(p.id, false)} className="rounded-lg bg-[#075cf0] px-4 py-3 font-semibold text-white disabled:opacity-50">{processandoRevisao ? "Registrando..." : "Registrar revisão"}</button>
          {revisao?.registro?.status === "revisado" && <button type="button" disabled={processandoRevisao} onClick={() => void registrarRevisao(p.id, true)} className="rounded-lg border border-red-700 px-4 py-3 font-semibold text-red-800 disabled:opacity-50">Revogar revisão</button>}
        </div>
        {avisoRevisao && <p role="status" className="mt-3 font-medium">{avisoRevisao}</p>}
        <div className="mt-4 border-t border-slate-300 pt-4">
          <p className="font-bold">Teste de prontidão (sem envio)</p>
          <p className="mt-1 text-slate-700">Confere validade da revisão, dados atuais da fonte e presença de configurações de transporte. Não cria nem transmite recados.</p>
          {!revisao?.vigente && <p className="mt-2 text-amber-900">O teste fica disponível quando uma revisão válida for recuperada do cadastro.</p>}
          <button type="button" disabled={!revisao?.vigente || testandoProntidao || processandoRevisao}
            onClick={() => void testarProntidao(p.id)}
            className="mt-3 rounded-lg border border-blue-700 px-4 py-3 font-semibold text-blue-800 disabled:opacity-50">
            {testandoProntidao ? "Verificando..." : "Testar prontidão sem enviar"}
          </button>
          {erroProntidao && <p role="alert" className="mt-2 text-red-800">{erroProntidao}</p>}
          {prontidao && <div role="status" className="mt-3 rounded-lg border border-slate-300 bg-white p-3">
            <p>Revisão vigente: <strong>{prontidao.revisaoVigente ? "Sim" : "Não"}</strong></p>
            <p>Consulta oficial concluída: <strong>{prontidao.consultaFonteConcluida ? "Sim" : "Não"}</strong></p>
            <p>Contato ainda corresponde à fonte: <strong>{prontidao.contatoIgualAoAtual ? "Sim" : "Não"}</strong></p>
            <p>Configurações básicas de e-mail presentes: <strong>{prontidao.credenciaisEnvioPresentes ? "Sim" : "Não"}</strong></p>
            {prontidao.configuracaoTransporte && <>
              <p className="ml-3 text-sm">Chave do provedor configurada: <strong>{prontidao.configuracaoTransporte.chaveResendConfigurada ? "Sim" : "Não"}</strong></p>
              <p className="ml-3 text-sm">Endereço remetente configurado: <strong>{prontidao.configuracaoTransporte.remetenteConfigurado ? "Sim" : "Não"}</strong></p>
            </>}
            <p className="mt-2 text-xs text-slate-700">Este diagnóstico verifica apenas a presença das configurações. Não confirma a autorização do domínio ou a entrega de mensagens.</p>
            <p className="mt-2 font-bold text-red-700">Envio bloqueado. Nenhuma mensagem foi enviada.</p>
          </div>}
        </div>
      </div>}
      {consulta.resultado.fonteUrl && <a href={consulta.resultado.fonteUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-semibold text-blue-700 underline">Consultar fonte institucional</a>}
      <p className="mt-4 border-t pt-3 text-sm font-bold text-red-700">Envio bloqueado. Nenhuma mensagem foi enviada.</p>
      <p className="mt-2 text-xs text-black/60">Consulta realizada em {new Date(consulta.consultadoEm).toLocaleString("pt-BR")}.</p>
    </div>}
      </div>)}
    </div>}
  </section>;
}
