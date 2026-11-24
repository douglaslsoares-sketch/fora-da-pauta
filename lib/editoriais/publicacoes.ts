import { bancoEditoriais } from "./db";
export type Publicacao = { slug:string; titulo:string; resumo:string; categoria:string; corpo:string; imagem_url:string|null; audio_url:string|null; publicado_em:Date; fontes:{titulo:string;url:string}[] };
export async function listarPublicacoes() {
 return bancoEditoriais()<Publicacao[]>`SELECT slug,titulo,resumo,categoria,corpo,imagem_url,audio_url,publicado_em,fontes FROM editoriais.publicacoes WHERE estado='publicado' AND publicado_em <= now() ORDER BY publicado_em DESC,id DESC`;
}
export async function buscarPublicacao(slug:string) {
 const rows = await bancoEditoriais()<Publicacao[]>`SELECT slug,titulo,resumo,categoria,corpo,imagem_url,audio_url,publicado_em,fontes FROM editoriais.publicacoes WHERE slug=${slug} AND estado='publicado' AND publicado_em <= now()`;
 return rows[0] ?? null;
}
