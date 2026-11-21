"use client";

import { useState } from "react";

type Resultado = {
  dominio: string;
  situacao: string;
  statusResend?: string;
  dominioVerificadoNoResend?: boolean;
  mensagem: string;
  consultadoEm: string;
  envioHabilitado: false;
};

export default function AdminResendDomainStatus() {
  const [consultando, setConsultando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState("");

  async function consultar() {
    if (consultando) return;
    setConsultando(true);
    setResultado(null);
    setErro("");
    try {
      const resposta = await fetch("/api/admin/contatos-politicos/dominio-resend", {
        cache: "no-store",
      });
      const dados = await resposta.json() as Resultado & { erro?: string };
      if (!resposta.ok) throw new Error(dados.erro || dados.mensagem || "Consulta indisponível.");
      setResultado(dados);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível concluir a consulta.");
    } finally {
      setConsultando(false);
    }
  }

  const situacao = resultado?.situacao === "nao_configurado"
    ? "Chave não configurada neste ambiente"
    : resultado?.situacao === "dominio_nao_encontrado"
      ? "Domínio não encontrado na conta consultada"
      : resultado?.situacao === "encontrado"
        ? resultado.statusResend === "verified"
          ? "Domínio verificado no Resend"
          : "Estado no Resend: " + (resultado.statusResend || "desconhecido")
        : resultado ? "Consulta inconclusiva" : "";

  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <p className="text-sm leading-6 text-black/65">
        A verificação da Vercel não confirma autorização para envio de e-mails.
        Este teste usa a API do Resend somente para leitura. Uma chave restrita
        exclusivamente a envios pode não permitir esta consulta.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <button type="button" onClick={() => void consultar()} disabled={consultando}
          className="rounded-lg bg-[#075cf0] px-4 py-3 font-semibold text-white disabled:opacity-50">
          {consultando ? "Consultando..." : "Consultar domínio no Resend"}
        </button>
        <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer"
          className="text-sm font-semibold text-blue-800 underline underline-offset-4">
          Conferir no Resend em outra guia
        </a>
      </div>
      {erro && <p role="alert" className="mt-3 text-sm text-red-700">{erro}</p>}
      {resultado && <div role="status" aria-live="polite"
        className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
        <p><strong>{resultado.dominio}</strong>: {situacao}</p>
        <p className="mt-2 text-black/70">{resultado.mensagem}</p>
        <p className="mt-2 text-xs text-black/60">
          Consultado em {new Date(resultado.consultadoEm).toLocaleString("pt-BR")}.
        </p>
        <p className="mt-2 font-semibold text-red-700">O envio permanece bloqueado.</p>
      </div>}
    </div>
  );
}
