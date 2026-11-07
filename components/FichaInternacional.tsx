import type { PessoaPoliticaInternacional } from "@/data/pessoas/modelo-pessoa-politica";
import { FichaPoliticaEstrutura } from "@/components/FichaPoliticaEstrutura";

const paises: Record<string,string> = {US:"Estados Unidos",IL:"Israel"};
const rotuloPais=(p:string)=>paises[p]??p;
const fonteValida=(url?:string)=>Boolean(url && /^https:\/\//i.test(url));

export function FichaInternacional({pessoa}:{pessoa:PessoaPoliticaInternacional}) {
  const vinculos=pessoa.vinculos.filter(v=>v.descricao.trim() && fonteValida(v.fonte?.url));
  const fatos=pessoa.acontecimentos.filter(e=>e.natureza==="fato-documentado" && fonteValida(e.fonte?.url) && e.titulo.trim() && e.categoria!=="declaracao" && e.categoria!=="investigacao");
  return <FichaPoliticaEstrutura nome={pessoa.nomePublico} subtitulo={pessoa.paises.map(rotuloPais).join(", ")} fonteIdentidade={pessoa.fonteIdentidade.url}>
    {vinculos.length>0?<section className="mt-8" aria-labelledby="vinculos"><h2 id="vinculos" className="text-xl font-semibold">Cargos, partidos e instituições</h2><ul className="mt-4 space-y-4">{vinculos.map((v,i)=><li key={i} className="border-b border-black/10 pb-4"><p className="font-medium">{v.descricao} — {rotuloPais(v.pais)}</p>{v.inicio?<p className="text-sm">Início: {v.inicio}</p>:null}{v.fim?<p className="text-sm">Fim: {v.fim}</p>:null}<a href={v.fonte.url} target="_blank" rel="noopener noreferrer" className="text-sm underline">Conferir fonte ↗</a></li>)}</ul></section>:null}
    {fatos.length>0?<section className="mt-8" aria-labelledby="fatos"><h2 id="fatos" className="text-xl font-semibold">Acontecimentos comprovados</h2><ol className="mt-4 space-y-4">{fatos.map((e,i)=><li key={i} className="border-b border-black/10 pb-4"><p className="text-sm">{e.data}</p><p className="font-semibold">{e.titulo}</p>{e.descricao?<p className="mt-2">{e.descricao}</p>:null}<a href={e.fonte.url} target="_blank" rel="noopener noreferrer" className="text-sm underline">Conferir fonte ↗</a></li>)}</ol></section>:null}
  </FichaPoliticaEstrutura>;
}
