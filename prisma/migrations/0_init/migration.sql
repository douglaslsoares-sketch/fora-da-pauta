-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "PessoaPolitica" (
    "id" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "nomePublico" TEXT,
    "fotoUrl" TEXT,
    "fotoFonteTitulo" TEXT,
    "fotoFonteUrl" TEXT,
    "fotoDataReferencia" DATE,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PessoaPolitica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidatura" (
    "id" TEXT NOT NULL,
    "pessoaPoliticaId" TEXT NOT NULL,
    "eleicao" INTEGER NOT NULL,
    "nomeCompleto" TEXT,
    "nomeUrna" TEXT,
    "numero" INTEGER,
    "cargo" TEXT NOT NULL,
    "uf" TEXT,
    "partido" TEXT,
    "siglaPartido" TEXT,
    "federacao" TEXT,
    "situacao" TEXT,
    "situacaoTse" TEXT,
    "fonteOficial" TEXT,
    "ultimaVerificacao" DATE,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoPolitico" (
    "id" TEXT NOT NULL,
    "pessoaPoliticaId" TEXT NOT NULL,
    "chaveOrigem" TEXT,
    "tipo" TEXT NOT NULL,
    "dataOrdenacao" TEXT,
    "periodo" TEXT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "fonteTitulo" TEXT,
    "fonteUrl" TEXT,
    "dados" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventoPolitico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeclaracaoPatrimonial" (
    "id" TEXT NOT NULL,
    "pessoaPoliticaId" TEXT NOT NULL,
    "candidaturaId" TEXT NOT NULL,
    "eleicao" INTEGER NOT NULL,
    "valorTotal" DECIMAL(18,2) NOT NULL,
    "fonteTitulo" TEXT,
    "fonteUrl" TEXT,
    "verificadoEm" DATE,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeclaracaoPatrimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BemPatrimonial" (
    "id" TEXT NOT NULL,
    "declaracaoId" TEXT NOT NULL,
    "tipo" TEXT,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(18,2) NOT NULL,
    "ordem" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BemPatrimonial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PessoaPolitica_nomeCompleto_idx" ON "PessoaPolitica"("nomeCompleto");

-- CreateIndex
CREATE INDEX "PessoaPolitica_nomePublico_idx" ON "PessoaPolitica"("nomePublico");

-- CreateIndex
CREATE INDEX "Candidatura_pessoaPoliticaId_idx" ON "Candidatura"("pessoaPoliticaId");

-- CreateIndex
CREATE INDEX "Candidatura_eleicao_idx" ON "Candidatura"("eleicao");

-- CreateIndex
CREATE INDEX "Candidatura_cargo_idx" ON "Candidatura"("cargo");

-- CreateIndex
CREATE INDEX "Candidatura_uf_idx" ON "Candidatura"("uf");

-- CreateIndex
CREATE INDEX "Candidatura_siglaPartido_idx" ON "Candidatura"("siglaPartido");

-- CreateIndex
CREATE UNIQUE INDEX "EventoPolitico_chaveOrigem_key" ON "EventoPolitico"("chaveOrigem");

-- CreateIndex
CREATE INDEX "EventoPolitico_pessoaPoliticaId_idx" ON "EventoPolitico"("pessoaPoliticaId");

-- CreateIndex
CREATE INDEX "EventoPolitico_tipo_idx" ON "EventoPolitico"("tipo");

-- CreateIndex
CREATE INDEX "EventoPolitico_dataOrdenacao_idx" ON "EventoPolitico"("dataOrdenacao");

-- CreateIndex
CREATE UNIQUE INDEX "DeclaracaoPatrimonial_candidaturaId_key" ON "DeclaracaoPatrimonial"("candidaturaId");

-- CreateIndex
CREATE INDEX "DeclaracaoPatrimonial_pessoaPoliticaId_idx" ON "DeclaracaoPatrimonial"("pessoaPoliticaId");

-- CreateIndex
CREATE INDEX "DeclaracaoPatrimonial_eleicao_idx" ON "DeclaracaoPatrimonial"("eleicao");

-- CreateIndex
CREATE INDEX "BemPatrimonial_declaracaoId_idx" ON "BemPatrimonial"("declaracaoId");

-- AddForeignKey
ALTER TABLE "Candidatura" ADD CONSTRAINT "Candidatura_pessoaPoliticaId_fkey" FOREIGN KEY ("pessoaPoliticaId") REFERENCES "PessoaPolitica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoPolitico" ADD CONSTRAINT "EventoPolitico_pessoaPoliticaId_fkey" FOREIGN KEY ("pessoaPoliticaId") REFERENCES "PessoaPolitica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclaracaoPatrimonial" ADD CONSTRAINT "DeclaracaoPatrimonial_pessoaPoliticaId_fkey" FOREIGN KEY ("pessoaPoliticaId") REFERENCES "PessoaPolitica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclaracaoPatrimonial" ADD CONSTRAINT "DeclaracaoPatrimonial_candidaturaId_fkey" FOREIGN KEY ("candidaturaId") REFERENCES "Candidatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BemPatrimonial" ADD CONSTRAINT "BemPatrimonial_declaracaoId_fkey" FOREIGN KEY ("declaracaoId") REFERENCES "DeclaracaoPatrimonial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
