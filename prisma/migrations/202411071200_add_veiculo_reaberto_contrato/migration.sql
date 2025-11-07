-- Adiciona campo para indicar se o veículo foi reaberto para contrato
ALTER TABLE "CheckList"
ADD COLUMN "veiculo_reaberto_contrato" BOOLEAN NOT NULL DEFAULT false;

