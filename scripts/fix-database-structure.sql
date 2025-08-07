-- Script para corrigir a estrutura do banco de dados
-- Executar no servidor de produção

-- 1. Corrigir tabela tipos_pao
-- Renomear coluna precoBase para preco_base se ainda não foi feito
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'tipos_pao' AND column_name = 'precoBase') THEN
        ALTER TABLE tipos_pao RENAME COLUMN "precoBase" TO "preco_base";
    END IF;
END $$;

-- 2. Corrigir tabela pedidos
-- Remover colunas antigas se existirem
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'pedidos' AND column_name = 'clienteId') THEN
        ALTER TABLE pedidos DROP COLUMN "clienteId";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'pedidos' AND column_name = 'tipoPaoId') THEN
        ALTER TABLE pedidos DROP COLUMN "tipoPaoId";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'pedidos' AND column_name = 'precoTotal') THEN
        ALTER TABLE pedidos DROP COLUMN "precoTotal";
    END IF;
END $$;

-- 3. Adicionar colunas corretas se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pedidos' AND column_name = 'cliente_id') THEN
        ALTER TABLE pedidos ADD COLUMN "cliente_id" INTEGER NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pedidos' AND column_name = 'tipo_pao_id') THEN
        ALTER TABLE pedidos ADD COLUMN "tipo_pao_id" INTEGER NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pedidos' AND column_name = 'preco_total') THEN
        ALTER TABLE pedidos ADD COLUMN "preco_total" NUMERIC(10,2) NOT NULL DEFAULT 0.00;
    END IF;
END $$;

-- 4. Corrigir valores NULL na coluna preco_total
UPDATE pedidos SET preco_total = 0.00 WHERE preco_total IS NULL;

-- 5. Verificar se as colunas foram criadas corretamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('pedidos', 'tipos_pao', 'clientes')
ORDER BY table_name, ordinal_position;

-- 6. Verificar se há dados nas tabelas
SELECT 'pedidos' as tabela, COUNT(*) as total FROM pedidos
UNION ALL
SELECT 'tipos_pao' as tabela, COUNT(*) as total FROM tipos_pao
UNION ALL
SELECT 'clientes' as tabela, COUNT(*) as total FROM clientes; 