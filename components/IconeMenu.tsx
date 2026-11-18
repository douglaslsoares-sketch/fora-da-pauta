import type { SVGProps } from "react";

type NomeIcone = "publicacoes" | "escolher" | "acompanhando" | "recado" | "qr" | "compartilhar";
const caminhos: Record<NomeIcone, React.ReactNode> = {
  publicacoes: <><path d="M12 6.5c-2.6-1.7-5.3-1.9-9-1.4v13c3.7-.5 6.4-.3 9 1.4 2.6-1.7 5.3-1.9 9-1.4v-13c-3.7-.5-6.4-.3-9 1.4Z"/><path d="M12 6.5v13"/></>,
  escolher: <><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="10" cy="9" r="2"/><path d="M7 16c0-2 1.2-3 3-3s3 1 3 3M16 9h2M16 13h2"/></>,
  acompanhando: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2H3Z"/><path d="m16 11 2 2 4-4"/></>,
  recado: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 3v-6A7.5 7.5 0 1 1 20 11.5Z"/><path d="M8 10h8M8 14h5"/></>,
  qr: <><rect x="3" y="3" width="7" height="7" rx=".5"/><rect x="14" y="3" width="7" height="7" rx=".5"/><rect x="3" y="14" width="7" height="7" rx=".5"/><path d="M6 6h1M17 6h1M6 17h1M14 14h3v3h-3zM20 14v3M14 21h3M20 20v1"/></>,
  compartilhar: <><circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5M8 13l8 5"/></>
};
export function IconeMenu({ nome, ...props }: SVGProps<SVGSVGElement> & { nome: NomeIcone }) {
  return <svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{caminhos[nome]}</svg>;
}
