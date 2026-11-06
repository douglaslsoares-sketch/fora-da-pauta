"use client";
import { usePathname } from "next/navigation";
import { BotaoFecharRodape } from "@/components/BotaoFecharRodape";
export function RodapePaginasInternas(){
 const path=usePathname();
 if(path==="/" || path.startsWith("/admin/") || path.startsWith("/api/") || ["/escolher-quem-acompanhar","/compartilhar","/instalar"].includes(path)) return null;
 return <footer className="bg-white px-5 py-3"><BotaoFecharRodape/></footer>;
}
