import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function EnderecoLegado({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/pessoas/${encodeURIComponent(id)}`);
}
