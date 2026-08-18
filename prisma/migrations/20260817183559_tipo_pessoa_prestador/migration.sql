-- CreateEnum
CREATE TYPE "TipoPessoa" AS ENUM ('PESSOA_FISICA', 'PESSOA_JURIDICA');

-- AlterTable
ALTER TABLE "colaboradores" ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "tipoPessoa" "TipoPessoa" NOT NULL DEFAULT 'PESSOA_FISICA';
