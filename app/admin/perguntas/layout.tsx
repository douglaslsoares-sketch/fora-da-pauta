import type { Metadata } from "next";

export const metadata: Metadata = {
  applicationName: "Fora da Pauta Admin",
  manifest: "/admin-manifest.webmanifest",
  appleWebApp: { capable: true, title: "Fora da Pauta Admin", statusBarStyle: "black-translucent" },
};

export default function AdminPerguntasLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
