import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = {
  applicationName: "Políticos",
  title: { default: "Políticos", template: "%s | Políticos" },
  description: "Acompanhe quem nos representa.",
  manifest: "/politicos/manifest.webmanifest",
  icons: { icon: [{ url: "/politicos/icone.svg", type: "image/svg+xml" }] },
  appleWebApp: { capable: true, title: "Políticos", statusBarStyle: "black-translucent" },
};
export default function LayoutPoliticos({children}: {children: ReactNode}) {
  return children;
}
