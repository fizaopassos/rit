-- CreateEnum
CREATE TYPE "TipoEquipamento" AS ENUM ('NOTEBOOK', 'DESKTOP', 'TELEFONE_VOIP', 'SMARTPHONE', 'MONITOR', 'IMPRESSORA', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusEquipamento" AS ENUM ('EM_ESTOQUE', 'EM_USO', 'EM_MANUTENCAO', 'BAIXADO');

-- CreateEnum
CREATE TYPE "ProprietarioTipo" AS ENUM ('ADMINISTRADORA', 'ASSOCIACAO_CONDOMINIO');

-- CreateEnum
CREATE TYPE "MotivoBaixa" AS ENUM ('FURTO_ROUBO', 'PERDA', 'OBSOLESCENCIA', 'DOACAO', 'VENDA', 'QUEBRA_IRREPARAVEL', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoAlocacao" AS ENUM ('COMODATO', 'USO_INTERNO', 'EMPRESTIMO_TEMPORARIO');

-- CreateEnum
CREATE TYPE "MotivoDevolucao" AS ENUM ('SAIDA_FUNCIONARIO', 'TROCA_APARELHO', 'FERIAS_LICENCA', 'OUTROS');

-- CreateEnum
CREATE TYPE "TipoAnexo" AS ENUM ('NOTA_FISCAL', 'TERMO_COMODATO', 'CHECKLIST_DEVOLUCAO', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoManutencao" AS ENUM ('PREVENTIVA', 'CORRETIVA', 'TROCA_PECA');

-- CreateEnum
CREATE TYPE "TipoLicenca" AS ENUM ('PERPETUA', 'ASSINATURA');

-- CreateEnum
CREATE TYPE "StatusLinha" AS ENUM ('ATIVA', 'CANCELADA', 'SEM_USO');

-- CreateEnum
CREATE TYPE "StatusEmailWorkspace" AS ENUM ('EM_USO', 'SEM_USO');

-- CreateEnum
CREATE TYPE "StatusColaborador" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "PerfilAcesso" AS ENUM ('ADMIN', 'CONSULTA');

-- CreateTable
CREATE TABLE "marcas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modelos" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipoEquipamento" "TipoEquipamento" NOT NULL,
    "vidaUtilAnos" INTEGER DEFAULT 5,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modelos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condominios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "endereco" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "condominios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colaboradores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "rg" TEXT,
    "cpfCifrado" BYTEA,
    "cargo" TEXT,
    "condominioId" TEXT,
    "status" "StatusColaborador" NOT NULL DEFAULT 'ATIVO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colaboradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipamentos" (
    "id" TEXT NOT NULL,
    "modeloId" TEXT NOT NULL,
    "tipoEquipamento" "TipoEquipamento" NOT NULL,
    "numeroSerie" TEXT,
    "numeroPatrimonio" TEXT NOT NULL,
    "proprietarioTipo" "ProprietarioTipo" NOT NULL,
    "condominioId" TEXT NOT NULL,
    "status" "StatusEquipamento" NOT NULL DEFAULT 'EM_ESTOQUE',
    "notaFiscalNumero" TEXT,
    "notaFiscalValor" DECIMAL(12,2),
    "notaFiscalData" TIMESTAMP(3),
    "dataAquisicao" TIMESTAMP(3),
    "ipLocal" TEXT,
    "macAddress" TEXT,
    "numeroRamal" TEXT,
    "itensInclusos" TEXT,
    "observacoes" TEXT,
    "dataBaixa" TIMESTAMP(3),
    "motivoBaixa" "MotivoBaixa",
    "observacaoBaixa" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alocacoes" (
    "id" TEXT NOT NULL,
    "equipamentoId" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "tipo" "TipoAlocacao" NOT NULL DEFAULT 'COMODATO',
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFim" TIMESTAMP(3),
    "motivoDevolucao" "MotivoDevolucao",
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alocacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anexos" (
    "id" TEXT NOT NULL,
    "equipamentoId" TEXT NOT NULL,
    "alocacaoId" TEXT,
    "tipo" "TipoAnexo" NOT NULL,
    "arquivoUrl" TEXT NOT NULL,
    "numeroDocumento" TEXT,
    "valor" DECIMAL(12,2),
    "data" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anexos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manutencoes" (
    "id" TEXT NOT NULL,
    "equipamentoId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "tipo" "TipoManutencao" NOT NULL,
    "descricao" TEXT NOT NULL,
    "pecaTrocada" TEXT,
    "custo" DECIMAL(12,2),
    "fornecedor" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manutencoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licencas" (
    "id" TEXT NOT NULL,
    "nomeSoftware" TEXT NOT NULL,
    "tipo" "TipoLicenca" NOT NULL,
    "equipamentoId" TEXT,
    "colaboradorId" TEXT,
    "chaveLicenca" TEXT,
    "dataInicio" TIMESTAMP(3),
    "dataVencimento" TIMESTAMP(3),
    "valor" DECIMAL(12,2),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "licencas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linhas" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "operadora" TEXT,
    "plano" TEXT,
    "valorMensal" DECIMAL(10,2),
    "franquiaDadosGb" DECIMAL(6,2),
    "status" "StatusLinha" NOT NULL DEFAULT 'SEM_USO',
    "equipamentoId" TEXT,
    "colaboradorId" TEXT,
    "dataAtivacao" TIMESTAMP(3),
    "dataCancelamento" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "linhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emails_workspace" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "StatusEmailWorkspace" NOT NULL DEFAULT 'SEM_USO',
    "colaboradorId" TEXT,
    "condominioId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emails_workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "perfil" "PerfilAcesso" NOT NULL DEFAULT 'CONSULTA',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" TEXT NOT NULL,
    "appUsuarioId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "campoSensivel" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marcas_nome_key" ON "marcas"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "modelos_marcaId_nome_key" ON "modelos"("marcaId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "condominios_codigo_key" ON "condominios"("codigo");

-- CreateIndex
CREATE INDEX "colaboradores_status_idx" ON "colaboradores"("status");

-- CreateIndex
CREATE UNIQUE INDEX "equipamentos_numeroSerie_key" ON "equipamentos"("numeroSerie");

-- CreateIndex
CREATE UNIQUE INDEX "equipamentos_numeroPatrimonio_key" ON "equipamentos"("numeroPatrimonio");

-- CreateIndex
CREATE INDEX "equipamentos_status_idx" ON "equipamentos"("status");

-- CreateIndex
CREATE INDEX "equipamentos_condominioId_idx" ON "equipamentos"("condominioId");

-- CreateIndex
CREATE INDEX "equipamentos_proprietarioTipo_idx" ON "equipamentos"("proprietarioTipo");

-- CreateIndex
CREATE INDEX "alocacoes_equipamentoId_dataFim_idx" ON "alocacoes"("equipamentoId", "dataFim");

-- CreateIndex
CREATE INDEX "alocacoes_colaboradorId_dataFim_idx" ON "alocacoes"("colaboradorId", "dataFim");

-- CreateIndex
CREATE INDEX "licencas_dataVencimento_idx" ON "licencas"("dataVencimento");

-- CreateIndex
CREATE UNIQUE INDEX "linhas_numero_key" ON "linhas"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "linhas_equipamentoId_key" ON "linhas"("equipamentoId");

-- CreateIndex
CREATE INDEX "linhas_status_idx" ON "linhas"("status");

-- CreateIndex
CREATE UNIQUE INDEX "emails_workspace_email_key" ON "emails_workspace"("email");

-- CreateIndex
CREATE UNIQUE INDEX "app_usuarios_email_key" ON "app_usuarios"("email");

-- CreateIndex
CREATE INDEX "logs_auditoria_entidade_entidadeId_idx" ON "logs_auditoria"("entidade", "entidadeId");

-- CreateIndex
CREATE INDEX "logs_auditoria_campoSensivel_idx" ON "logs_auditoria"("campoSensivel");

-- AddForeignKey
ALTER TABLE "modelos" ADD CONSTRAINT "modelos_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colaboradores" ADD CONSTRAINT "colaboradores_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "condominios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipamentos" ADD CONSTRAINT "equipamentos_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "modelos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipamentos" ADD CONSTRAINT "equipamentos_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "condominios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alocacoes" ADD CONSTRAINT "alocacoes_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "equipamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alocacoes" ADD CONSTRAINT "alocacoes_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anexos" ADD CONSTRAINT "anexos_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "equipamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anexos" ADD CONSTRAINT "anexos_alocacaoId_fkey" FOREIGN KEY ("alocacaoId") REFERENCES "alocacoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manutencoes" ADD CONSTRAINT "manutencoes_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "equipamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licencas" ADD CONSTRAINT "licencas_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "equipamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licencas" ADD CONSTRAINT "licencas_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linhas" ADD CONSTRAINT "linhas_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "equipamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linhas" ADD CONSTRAINT "linhas_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails_workspace" ADD CONSTRAINT "emails_workspace_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails_workspace" ADD CONSTRAINT "emails_workspace_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "condominios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_appUsuarioId_fkey" FOREIGN KEY ("appUsuarioId") REFERENCES "app_usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
