/*
  Warnings:

  - You are about to drop the column `itensInclusos` on the `equipamentos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "alocacoes" ADD COLUMN     "itensDevolucao" TEXT,
ADD COLUMN     "itensEntrega" TEXT;

-- AlterTable
ALTER TABLE "equipamentos" DROP COLUMN "itensInclusos";
