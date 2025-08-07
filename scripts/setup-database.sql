-- Script para configurar o banco de dados PostgreSQL
-- Execute este script como superusuário (postgres)

-- Criar banco de dados
CREATE DATABASE pedidos_db;

-- Criar usuário (opcional - você pode usar o usuário postgres)
-- CREATE USER pedidos_user WITH PASSWORD 'password';

-- Conceder privilégios (se criou usuário específico)
-- GRANT ALL PRIVILEGES ON DATABASE pedidos_db TO pedidos_user;

-- Conectar ao banco de dados
\c pedidos_db;

-- Criar extensão para UUID (opcional)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verificar se a tabela foi criada (será criada automaticamente pelo TypeORM)
-- \dt

-- Comandos úteis para verificar:
-- \l (listar bancos de dados)
-- \dt (listar tabelas)
-- \d pedidos (descrever estrutura da tabela) 