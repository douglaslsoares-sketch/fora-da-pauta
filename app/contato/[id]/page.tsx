import Link from "next/link";
import { notFound } from "next/navigation";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { formatarCargo } from "@/lib/eleicoes/formatar-cargo";
import { CandidatePhoto } from "@/components/CandidatePhoto";
import { FormularioRecado } from "@/components/FormularioRecado";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mandar um recado — Fora da Pauta", robots: { index: false, follow: false } };
type Props = { params: Promise<{ id: string }> };

export default async function ContatoRepresentante({ params }: Props) {
  const { id } = await params;
  if (!/^\d{8,20}$/.test(id)) notFound();
  const pessoa = candidaturas.find(item => item.id === id);
  if (!pessoa) notFound();
  const cargo = formatarCargo(pessoa.cargo, pessoa.genero);
  return (
    <main className="min-h-screen bg-white px-5 py-10 text-black">
      <div className="mx-auto max-w-[720px]">
        <div className="flex items-center gap-4 rounded-2xl border border-black/15 p-4 shadow-sm">
          <CandidatePhoto id={pessoa.id} name={pessoa.nomeUrna} />
          <div className="min-w-0">
            <p className="font-bold">{pessoa.nomeUrna}</p>
            <p className="mt-1 text-sm text-black/65">{cargo} · {pessoa.uf} · {pessoa.siglaPartido}</p>
          </div>
        </div>
        <FormularioRecado candidaturaId={pessoa.id} />
        <div className="mt-8 flex justify-center">
          <Link href="/central" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-7 py-3 font-semibold text-white hover:bg-red-700">
            <span aria-hidden="true">×</span> Fechar
          </Link>
        </div>
      </div>
    </main>
  );
}
