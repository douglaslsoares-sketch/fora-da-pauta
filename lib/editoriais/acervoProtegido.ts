import {sql} from "@/lib/interesses/db";

export async function protegerArtigos(){
 await sql.begin(async tx=>{
  await tx`SELECT pg_advisory_xact_lock(49261382)`;
  await tx`DO $m$
  BEGIN
   IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.admin_artigos'::regclass AND tgname='fdp_artigo_permanente' AND NOT tgisinternal) THEN
    CREATE OR REPLACE FUNCTION public.fdp_proteger_artigo() RETURNS trigger LANGUAGE plpgsql AS $f$
    BEGIN
     IF OLD.status IN ('publicado','arquivado') THEN RAISE EXCEPTION 'Editorial publicado é permanente' USING ERRCODE='23514'; END IF;
     IF TG_OP='DELETE' THEN RETURN OLD; END IF;
     RETURN NEW;
    END;
    $f$;
    CREATE TRIGGER fdp_artigo_permanente BEFORE UPDATE OR DELETE ON public.admin_artigos FOR EACH ROW EXECUTE FUNCTION public.fdp_proteger_artigo();
   END IF;
   IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.admin_artigos_audio'::regclass AND tgname='fdp_audio_permanente' AND NOT tgisinternal) THEN
    CREATE OR REPLACE FUNCTION public.fdp_proteger_audio() RETURNS trigger LANGUAGE plpgsql AS $f$
    DECLARE situacao text; alvo uuid;
    BEGIN
     IF TG_OP='UPDATE' AND OLD.artigo_id IS DISTINCT FROM NEW.artigo_id THEN RAISE EXCEPTION 'Identidade do áudio imutável' USING ERRCODE='23514'; END IF;
     IF TG_OP='DELETE' THEN alvo:=OLD.artigo_id; ELSE alvo:=NEW.artigo_id; END IF;
     SELECT status INTO situacao FROM public.admin_artigos WHERE id=alvo FOR UPDATE;
     IF situacao IN ('publicado','arquivado') THEN RAISE EXCEPTION 'Áudio publicado é permanente' USING ERRCODE='23514'; END IF;
     IF TG_OP='DELETE' THEN RETURN OLD; END IF;
     RETURN NEW;
    END;
    $f$;
    CREATE TRIGGER fdp_audio_permanente BEFORE INSERT OR UPDATE OR DELETE ON public.admin_artigos_audio FOR EACH ROW EXECUTE FUNCTION public.fdp_proteger_audio();
   END IF;
  END $m$`;
 });
}

export async function protegerComentarios(){
 await sql.begin(async tx=>{
  await tx`SELECT pg_advisory_xact_lock(49261383)`;
  await tx`DO $m$
  BEGIN
   IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.editoriais_comentarios'::regclass AND tgname='fdp_comentario_permanente' AND NOT tgisinternal) THEN
    CREATE OR REPLACE FUNCTION public.fdp_proteger_comentario() RETURNS trigger LANGUAGE plpgsql AS $f$
    BEGIN
     IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Comentário permanente' USING ERRCODE='23514'; END IF;
     IF (to_jsonb(OLD)-'estado'-'aprovado_em'-'denuncias') IS DISTINCT FROM (to_jsonb(NEW)-'estado'-'aprovado_em'-'denuncias') THEN RAISE EXCEPTION 'Conteúdo do comentário imutável' USING ERRCODE='23514'; END IF;
     IF OLD.estado<>'pendente' AND (OLD.estado IS DISTINCT FROM NEW.estado OR OLD.aprovado_em IS DISTINCT FROM NEW.aprovado_em) THEN RAISE EXCEPTION 'Decisão definitiva do comentário' USING ERRCODE='23514'; END IF;
     RETURN NEW;
    END;
    $f$;
    CREATE TRIGGER fdp_comentario_permanente BEFORE UPDATE OR DELETE ON public.editoriais_comentarios FOR EACH ROW EXECUTE FUNCTION public.fdp_proteger_comentario();
   END IF;
  END $m$`;
 });
}
