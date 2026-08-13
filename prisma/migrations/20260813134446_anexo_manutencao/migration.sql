-- AlterTable
ALTER TABLE "anexos" ADD COLUMN     "manutencaoId" TEXT;

-- AddForeignKey
ALTER TABLE "anexos" ADD CONSTRAINT "anexos_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "manutencoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
