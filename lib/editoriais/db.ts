import postgres from "postgres";
let connection: ReturnType<typeof postgres> | undefined;
export function bancoEditoriais() {
 const url = process.env.EDITORIAIS_DATABASE_URL;
 if (!url) throw new Error("Banco de Editoriais não configurado.");
 return connection ??= postgres(url, { max: 3, prepare: false });
}
