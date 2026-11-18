import { headers } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const agente = (await headers()).get("user-agent") ?? "";
  const acessoMovel = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(agente);
  if (acessoMovel) {
    return (
      <main className="min-h-screen bg-[#141c2b] px-6 py-16 text-center text-white">
        <div className="mx-auto max-w-md">
          <h1 className="text-2xl font-bold">Administração disponível somente no computador</h1>
          <p className="mt-5 leading-7 text-white/80">O painel do Fora da Pauta foi reservado para uso no desktop. Continue navegando pelo site normalmente no celular.</p>
          <Link className="mt-8 inline-flex rounded-lg bg-white px-6 py-3 font-semibold text-[#141c2b]" href="/">Voltar ao site</Link>
        </div>
      </main>
    );
  }
  return <>{children}</>;
}
