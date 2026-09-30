"use client";

import { usePathname } from "next/navigation";

import { ShareCandidatePageButton } from "@/components/ShareCandidatePageButton";
import { SiteHeader } from "@/components/SiteHeader";

export function SiteChromeRouter() {
  const pathname = usePathname();

  const isHome =
    pathname === "/";

  const isCandidateIndex =
    pathname ===
    "/conheca-seu-candidato";

  const isCandidateProfile =
    /^\/conheca-seu-candidato\/[^/]+$/.test(
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
      {!isHome ? <SiteHeader /> : null}

      {isCandidateRoute ? (
        <>
          <ShareCandidatePageButton
            tipo={tipoCompartilhamento}
          />


        </>
      ) : null}
    </>
  );
}