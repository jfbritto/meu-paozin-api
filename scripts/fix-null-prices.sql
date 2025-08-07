-- Script para corrigir valores NULL na coluna preco_total
-- Atualiza registros com preco_total NULL para 0.00

UPDATE pedidos 
SET preco_total = 0.00 
WHERE preco_total IS NULL;

-- Verifica se ainda há valores NULL
SELECT COUNT(*) as registros_com_preco_null 
FROM pedidos 
WHERE preco_total IS NULL;

-- Mostra alguns registros para verificação
SELECT id, preco_total, quantidade, tipo_pao_id 
FROM pedidos 
LIMIT 5; 