-- Script para migrar da tabela status_pedido para enum StatusPedido
-- Execute este script após atualizar o código da aplicação

-- 1. Adicionar a coluna status como enum (temporariamente nullable)
ALTER TABLE pedidos ADD COLUMN status_enum VARCHAR(20);

-- 2. Migrar os dados baseado no status_id atual
-- Assumindo que os IDs dos status são:
-- 1 = REALIZADO
-- 2 = ACEITO  
-- 3 = EM_PREPARO
-- 4 = SAIU_PARA_ENTREGA
-- 5 = FINALIZADO
-- 6 = CANCELADO

UPDATE pedidos SET status_enum = 'REALIZADO' WHERE status_id = 1;
UPDATE pedidos SET status_enum = 'ACEITO' WHERE status_id = 2;
UPDATE pedidos SET status_enum = 'EM_PREPARO' WHERE status_id = 3;
UPDATE pedidos SET status_enum = 'SAIU_PARA_ENTREGA' WHERE status_id = 4;
UPDATE pedidos SET status_enum = 'FINALIZADO' WHERE status_id = 5;
UPDATE pedidos SET status_enum = 'CANCELADO' WHERE status_id = 6;

-- 3. Remover a coluna status_id antiga
ALTER TABLE pedidos DROP COLUMN status_id;

-- 4. Renomear a nova coluna
ALTER TABLE pedidos RENAME COLUMN status_enum TO status;

-- 5. Alterar o tipo da coluna para enum
ALTER TABLE pedidos ALTER COLUMN status TYPE VARCHAR(20) USING status::VARCHAR(20);

-- 6. Adicionar constraint para garantir valores válidos
ALTER TABLE pedidos ADD CONSTRAINT check_status_enum 
CHECK (status IN ('CANCELADO', 'REALIZADO', 'ACEITO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'FINALIZADO'));

-- 7. Definir valor padrão
ALTER TABLE pedidos ALTER COLUMN status SET DEFAULT 'REALIZADO';

-- 8. Tornar a coluna NOT NULL
ALTER TABLE pedidos ALTER COLUMN status SET NOT NULL;

-- 9. Remover a tabela status_pedido (opcional - execute apenas se tiver certeza)
-- DROP TABLE IF EXISTS status_pedido;

-- Verificar se a migração foi bem-sucedida
SELECT status, COUNT(*) as total FROM pedidos GROUP BY status ORDER BY status; 