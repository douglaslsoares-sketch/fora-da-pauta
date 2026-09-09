BEGIN;

INSERT INTO aggregate_topics (
  slug,
  name,
  description,
  parent_topic_id,
  is_active
)
VALUES
  ('saude','Saúde','Saúde pública, atendimento, prevenção, hospitais, postos, medicamentos e acesso aos serviços de saúde.',NULL,TRUE),
  ('educacao','Educação','Educação infantil, básica, técnica e superior, escolas, professores, acesso e qualidade do ensino.',NULL,TRUE),
  ('trabalho-e-renda','Trabalho e renda','Emprego, geração de renda, salários, condições de trabalho, qualificação profissional e oportunidades.',NULL,TRUE),
  ('seguranca-publica','Segurança pública','Segurança, prevenção da violência, criminalidade, policiamento e proteção da população.',NULL,TRUE),
  ('economia-e-custo-de-vida','Economia e custo de vida','Inflação, preços, poder de compra, crescimento econômico, juros e custo de vida.',NULL,TRUE),
  ('corrupcao-e-integridade-publica','Corrupção e integridade pública','Combate à corrupção, transparência, integridade, fiscalização e uso correto de recursos públicos.',NULL,TRUE),
  ('democracia-e-instituicoes','Democracia e instituições','Democracia, instituições, participação política, eleições, equilíbrio entre Poderes e regras do Estado.',NULL,TRUE),
  ('habitacao','Habitação','Moradia, acesso à casa própria, aluguel, urbanização e políticas habitacionais.',NULL,TRUE),
  ('transporte-e-mobilidade','Transporte e mobilidade','Transporte público, mobilidade urbana, trânsito, deslocamentos, estradas e acesso ao transporte.',NULL,TRUE),
  ('meio-ambiente-e-clima','Meio ambiente e clima','Proteção ambiental, clima, florestas, água, conservação, desmatamento, poluição e transição ecológica.',NULL,TRUE),
  ('impostos-e-gastos-publicos','Impostos e gastos públicos','Tributos, carga tributária, orçamento, despesas públicas, dívida e prioridades de gasto do governo.',NULL,TRUE),
  ('protecao-social-e-desigualdade','Proteção social e desigualdade','Pobreza, desigualdade, assistência social, transferência de renda, proteção social e inclusão econômica.',NULL,TRUE),
  ('infraestrutura-e-saneamento','Infraestrutura e saneamento','Saneamento, água, esgoto, energia, obras públicas, conectividade e infraestrutura básica.',NULL,TRUE),
  ('agricultura-e-alimentacao','Agricultura e alimentação','Produção de alimentos, agricultura, abastecimento, segurança alimentar, campo e políticas rurais.',NULL,TRUE),
  ('ciencia-tecnologia-e-inovacao','Ciência, tecnologia e inovação','Pesquisa, ciência, tecnologia, inovação, transformação digital e desenvolvimento tecnológico.',NULL,TRUE),
  ('justica-e-direitos','Justiça e direitos','Acesso à Justiça, direitos civis e sociais, igualdade perante a lei e garantias fundamentais.',NULL,TRUE),
  ('cultura-esporte-e-lazer','Cultura, esporte e lazer','Cultura, esporte, lazer, acesso a atividades culturais e esportivas e políticas para essas áreas.',NULL,TRUE)
ON CONFLICT (slug)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = TRUE;

INSERT INTO aggregate_topic_aliases (
  aggregate_topic_id,
  alias_slug,
  alias_label
)
SELECT
  at.id,
  a.alias_slug,
  a.alias_label
FROM aggregate_topics at
JOIN (
  VALUES
    ('saude','saude-publica','Saúde pública'),
    ('saude','sistema-publico-de-saude','Sistema público de saúde'),
    ('saude','atendimento-na-saude','Atendimento na saúde'),
    ('saude','hospitais-e-postos-de-saude','Hospitais e postos de saúde'),

    ('educacao','educacao-publica','Educação pública'),
    ('educacao','ensino-publico','Ensino público'),
    ('educacao','escolas-publicas','Escolas públicas'),
    ('educacao','qualidade-da-educacao','Qualidade da educação'),

    ('trabalho-e-renda','emprego','Emprego'),
    ('trabalho-e-renda','empregos','Empregos'),
    ('trabalho-e-renda','emprego-e-renda','Emprego e renda'),
    ('trabalho-e-renda','geracao-de-empregos','Geração de empregos'),
    ('trabalho-e-renda','salarios','Salários'),
    ('trabalho-e-renda','trabalho','Trabalho'),

    ('seguranca-publica','seguranca','Segurança'),
    ('seguranca-publica','combate-a-criminalidade','Combate à criminalidade'),
    ('seguranca-publica','criminalidade','Criminalidade'),
    ('seguranca-publica','violencia','Violência'),

    ('economia-e-custo-de-vida','economia','Economia'),
    ('economia-e-custo-de-vida','custo-de-vida','Custo de vida'),
    ('economia-e-custo-de-vida','inflacao','Inflação'),
    ('economia-e-custo-de-vida','precos','Preços'),
    ('economia-e-custo-de-vida','poder-de-compra','Poder de compra'),

    ('corrupcao-e-integridade-publica','corrupcao','Corrupção'),
    ('corrupcao-e-integridade-publica','combate-a-corrupcao','Combate à corrupção'),
    ('corrupcao-e-integridade-publica','transparencia','Transparência'),
    ('corrupcao-e-integridade-publica','integridade-publica','Integridade pública'),

    ('democracia-e-instituicoes','democracia','Democracia'),
    ('democracia-e-instituicoes','instituicoes','Instituições'),
    ('democracia-e-instituicoes','defesa-da-democracia','Defesa da democracia'),

    ('habitacao','moradia','Moradia'),
    ('habitacao','casa-propria','Casa própria'),
    ('habitacao','politica-habitacional','Política habitacional'),

    ('transporte-e-mobilidade','transporte','Transporte'),
    ('transporte-e-mobilidade','transporte-publico','Transporte público'),
    ('transporte-e-mobilidade','mobilidade','Mobilidade'),
    ('transporte-e-mobilidade','mobilidade-urbana','Mobilidade urbana'),

    ('meio-ambiente-e-clima','meio-ambiente','Meio ambiente'),
    ('meio-ambiente-e-clima','clima','Clima'),
    ('meio-ambiente-e-clima','desmatamento','Desmatamento'),
    ('meio-ambiente-e-clima','protecao-ambiental','Proteção ambiental'),

    ('impostos-e-gastos-publicos','impostos','Impostos'),
    ('impostos-e-gastos-publicos','tributos','Tributos'),
    ('impostos-e-gastos-publicos','gastos-publicos','Gastos públicos'),
    ('impostos-e-gastos-publicos','orcamento-publico','Orçamento público'),

    ('protecao-social-e-desigualdade','pobreza','Pobreza'),
    ('protecao-social-e-desigualdade','desigualdade','Desigualdade'),
    ('protecao-social-e-desigualdade','assistencia-social','Assistência social'),
    ('protecao-social-e-desigualdade','transferencia-de-renda','Transferência de renda'),

    ('infraestrutura-e-saneamento','infraestrutura','Infraestrutura'),
    ('infraestrutura-e-saneamento','saneamento','Saneamento'),
    ('infraestrutura-e-saneamento','agua-e-esgoto','Água e esgoto'),
    ('infraestrutura-e-saneamento','energia','Energia'),

    ('agricultura-e-alimentacao','agricultura','Agricultura'),
    ('agricultura-e-alimentacao','alimentacao','Alimentação'),
    ('agricultura-e-alimentacao','seguranca-alimentar','Segurança alimentar'),
    ('agricultura-e-alimentacao','producao-de-alimentos','Produção de alimentos'),

    ('ciencia-tecnologia-e-inovacao','ciencia','Ciência'),
    ('ciencia-tecnologia-e-inovacao','tecnologia','Tecnologia'),
    ('ciencia-tecnologia-e-inovacao','inovacao','Inovação'),

    ('justica-e-direitos','justica','Justiça'),
    ('justica-e-direitos','direitos','Direitos'),
    ('justica-e-direitos','direitos-humanos','Direitos humanos'),
    ('justica-e-direitos','igualdade','Igualdade'),

    ('cultura-esporte-e-lazer','cultura','Cultura'),
    ('cultura-esporte-e-lazer','esporte','Esporte'),
    ('cultura-esporte-e-lazer','lazer','Lazer')
) AS a(topic_slug, alias_slug, alias_label)
  ON a.topic_slug = at.slug
ON CONFLICT (alias_slug)
DO UPDATE SET
  aggregate_topic_id = EXCLUDED.aggregate_topic_id,
  alias_label = EXCLUDED.alias_label;

COMMIT;
