-- CreateEnum
CREATE TYPE "tipo_transacao" AS ENUM ('Saída', 'Entrada');

-- CreateEnum
CREATE TYPE "origem_transacao" AS ENUM ('site', 'vault', 'import_fatura');

-- CreateEnum
CREATE TYPE "status_transacao" AS ENUM ('ativo', 'descartado');

-- CreateEnum
CREATE TYPE "status_fatura_import" AS ENUM ('pendente', 'confirmado', 'descartado');

-- CreateEnum
CREATE TYPE "tipo_arquivo_import" AS ENUM ('pdf', 'ofx');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "tipo" "tipo_transacao" NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "categoria" TEXT NOT NULL,
    "fonte" TEXT,
    "descricao" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "cobranca" DATE,
    "confirmado" BOOLEAN NOT NULL DEFAULT false,
    "origem" "origem_transacao" NOT NULL,
    "status" "status_transacao" NOT NULL DEFAULT 'ativo',
    "dedupe_hash" TEXT NOT NULL,
    "external_id" TEXT,
    "fatura_import_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorization_rules" (
    "id" TEXT NOT NULL,
    "palavra_chave" TEXT NOT NULL,
    "tipo" "tipo_transacao" NOT NULL,
    "categoria" TEXT NOT NULL,
    "prioridade" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorization_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fatura_imports" (
    "id" TEXT NOT NULL,
    "arquivo_nome" TEXT NOT NULL,
    "tipo_arquivo" "tipo_arquivo_import" NOT NULL,
    "fonte" TEXT NOT NULL,
    "status" "status_fatura_import" NOT NULL DEFAULT 'pendente',
    "raw_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),

    CONSTRAINT "fatura_imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_transactions_data" ON "transactions"("data");

-- CreateIndex
CREATE INDEX "idx_transactions_categoria" ON "transactions"("categoria");

-- CreateIndex
CREATE INDEX "idx_transactions_updated_at" ON "transactions"("updated_at");

-- CreateIndex
CREATE INDEX "idx_transactions_external_id" ON "transactions"("external_id");

-- CreateIndex
-- Índice único parcial: só bloqueia duplicata entre transações ativas.
-- Um dedupe_hash pode ser reaproveitado depois que a transação original
-- vira status='descartado' (soft delete).
CREATE UNIQUE INDEX "uq_transactions_dedupe_hash_ativo" ON "transactions"("dedupe_hash") WHERE "status" = 'ativo';

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_fatura_import_id_fkey" FOREIGN KEY ("fatura_import_id") REFERENCES "fatura_imports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
