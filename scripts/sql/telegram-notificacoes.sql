CREATE TABLE public.telegram_fontes_notificacao (
  tipo text NOT NULL CHECK (tipo IN ('candidato', 'edicoes')),
  referencia text NOT NULL,
  inicializado_at timestamptz NOT NULL DEFAULT now(),
  verificado_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tipo, referencia),
  CHECK (
    (tipo = 'candidato' AND referencia <> '') OR
    (tipo = 'edicoes' AND referencia = '')
  )
);

CREATE TABLE public.telegram_eventos_conhecidos (
  tipo text NOT NULL,
  referencia text NOT NULL,
  evento_id text NOT NULL CHECK (evento_id <> ''),
  registrado_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tipo, referencia, evento_id),
  FOREIGN KEY (tipo, referencia)
    REFERENCES public.telegram_fontes_notificacao (tipo, referencia)
);

CREATE TABLE public.telegram_fila_avisos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  telegram_chat_id bigint NOT NULL,
  tipo text NOT NULL,
  referencia text NOT NULL,
  evento_id text NOT NULL,
  texto text NOT NULL CHECK (char_length(texto) BETWEEN 1 AND 4096),
  status text NOT NULL DEFAULT 'pendente'
    CHECK (status IN (
      'pendente', 'processando', 'enviado',
      'cancelado', 'erro', 'incerto'
    )),
  tentativas integer NOT NULL DEFAULT 0 CHECK (tentativas >= 0),
  proxima_tentativa_at timestamptz NOT NULL DEFAULT now(),
  processamento_iniciado_at timestamptz,
  enviado_at timestamptz,
  telegram_message_id bigint,
  ultimo_erro_codigo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (telegram_chat_id, tipo, referencia, evento_id),
  FOREIGN KEY (tipo, referencia, evento_id)
    REFERENCES public.telegram_eventos_conhecidos
      (tipo, referencia, evento_id)
);

CREATE INDEX idx_telegram_fila_avisos_pendentes
  ON public.telegram_fila_avisos (proxima_tentativa_at, id)
  WHERE status IN ('pendente', 'erro');

CREATE INDEX idx_telegram_fila_avisos_processando
  ON public.telegram_fila_avisos (processamento_iniciado_at)
  WHERE status = 'processando';