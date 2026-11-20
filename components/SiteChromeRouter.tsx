"use client";

import { usePathname } from "next/navigation";

import { ShareCandidatePageButton } from "@/components/ShareCandidatePageButton";
import { SiteHeader } from "@/components/SiteHeader";

export function SiteChromeRouter() {
  const pathname = usePathname();

  const isHome =
    pathname === "/" || pathname === "/central" || pathname === "/simulacao/confirmacao-fique-de-olho";

  // Estas páginas já exibem a logomarca no próprio cabeçalho interno.
  const hasInternalHeader = ["/acompanhar", "/meus-acompanhamentos", "/mandar-recado", "/meus-recados", "/qr-code", "/edicoes"].some(route => pathname === route || pathname.startsWith(route + "/"));

  const isCandidateIndex =
    pathname ===
    "/conheca-seu-candidato";

  const isCandidateProfile =
    /^\/(?:conheca-seu-candidato|pessoas)\/[^/]+$/.test(
      pathname,
    );

  const isCandidateRoute =
    isCandidateIndex ||
    pathname.startsWith(
      "/conheca-seu-candidato/",
    );

  const tipoCompartilhamento =
    isCandidateIndex
      ? "consulta"
      : isCandidateProfile
        ? "ficha"
        : "pagina";

  return (
    <>
      {!isHome && !hasInternalHeader ? <SiteHeader /> : null}

      {isCandidateRoute && !isCandidateProfile ? (
        <>
          <ShareCandidatePageButton
            tipo={tipoCompartilhamento}
          />


        </>
      ) : null}
    </>
  );
}