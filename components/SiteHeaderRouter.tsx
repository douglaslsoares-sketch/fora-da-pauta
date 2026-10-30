"use client";

import type { ReactNode } from "react";

type SiteHeaderRouterProps = {
  children: ReactNode;
};

// Todas as páginas internas compartilham o mesmo cabeçalho do SiteHeader.
// Não renderizar variantes específicas para fichas ou candidatos.
export function SiteHeaderRouter({
  children,
}: SiteHeaderRouterProps) {
  return <>{children}</>;
}
