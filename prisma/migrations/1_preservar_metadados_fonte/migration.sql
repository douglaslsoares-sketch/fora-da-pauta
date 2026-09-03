-- AlterTable
ALTER TABLE "BemPatrimonial" ADD COLUMN     "tipoCodigo" TEXT;

-- AlterTable
ALTER TABLE "DeclaracaoPatrimonial" ADD COLUMN     "quantidadeDeBens" INTEGER;

-- AlterTable
ALTER TABLE "EventoPolitico" ADD COLUMN     "categoria" TEXT NOT NULL;
