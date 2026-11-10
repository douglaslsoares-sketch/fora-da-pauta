import { NextRequest, NextResponse } from "next/server";
import { candidaturasPorId, idsEleitosEm2026 } from "@/lib/eleicoes/acompanhamento-politico";
import { formatarCargo } from "@/lib/eleicoes/formatar-cargo";

export const dynamic = "force-dynamic";
const contatosMandato: Record<string,{email:string;cargo:string;fonte:string}> = {
  "160002536522": { email:"renatofreitas@assembleia.pr.leg.br", cargo:"deputado estadual do Paraná", fonte:"https://www.assembleia.pr.leg.br/" },
};
export async function GET(request:NextRequest){
  const id=new URL(request.url).searchParams.get("id")||"";
  if(!/^\d{8,20}$/.test(id))return NextResponse.json({erro:"Identificador inválido"},{status:400});
  const pessoa=candidaturasPorId.get(id);
  if(!pessoa)return NextResponse.json({erro:"Candidatura não encontrada"},{status:404});
  const resultado=(pessoa.resultadoEleitoral?.situacaoTse||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase();
  const eleito=idsEleitosEm2026.has(id)||/ELEIT[OA]/.test(resultado)&&!/NAO ELEIT/.test(resultado);
  const naoEleito=/NAO ELEIT|SUPLENTE/.test(resultado);
  const contato=contatosMandato[id];
  const situacao=contato?"mandato_atual":eleito?"eleito_aguardando_posse":naoEleito?"nao_eleito":"nao_confirmado";
  return NextResponse.json({
    nome:pessoa.nomeUrna,cargo:formatarCargo(pessoa.cargo),uf:pessoa.uf,partido:pessoa.siglaPartido,
    situacao,contato:contato||null,
    fonteEleitoral:"https://dadosabertos.tse.jus.br/",
  },{headers:{"Cache-Control":"public, s-maxage=3600, stale-while-revalidate=86400"}});
}
