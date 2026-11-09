"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function RodapePaginasInternas(){
 const path=usePathname();
 if(path==="/" || path==="/ha-mais-para-entender" || path==="/minhas-escolhas" || path==="/escolher-quem-acompanhar" || path.startsWith("/admin/") || path.startsWith("/api/")) return null;
 return <footer className="bg-white px-5 pb-8 pt-5"><div className="mx-auto max-w-2xl"><Link href="/ha-mais-para-entender" className="flex min-h-14 items-center justify-center rounded-lg bg-black px-5 py-3 text-center text-base font-extrabold text-white">HÁ MAIS PARA ENTENDER.</Link></div></footer>;
}
