import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AssinaturaEcossistema } from "@/components/AssinaturaEcossistema";
export const metadata: Metadata = {
 applicationName: "Editoriais", title: { absolute: "Editoriais" },
 description: "Análises, contexto e bastidores.",
 manifest: "/editoriais/manifest.webmanifest",
 icons: { icon: "/editoriais/icone.svg" },
 appleWebApp: { capable: true, title: "Editoriais", statusBarStyle: "black-translucent" }
};
export default function Layout({children}: {children: ReactNode}) {
 return <div style={{background:"#0b1c2d",color:"#fff",minHeight:"100vh"}}>{children}<AssinaturaEcossistema /></div>;
}
