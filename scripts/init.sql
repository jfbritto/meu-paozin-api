-- Script de inicialização do banco de dados MeuPaoZin
-- Este script é executado automaticamente quando o container PostgreSQL é criado

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verificar se estamos no banco correto
SELECT current_database();

-- As tabelas serão criadas automaticamente pelo TypeORM
-- Este script serve apenas para configurações iniciais 