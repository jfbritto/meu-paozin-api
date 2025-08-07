#!/bin/bash

# Script para configuração inicial das variáveis de ambiente
# MeuPaoZin API

set -e

echo "🚀 Configurando variáveis de ambiente para MeuPaoZin API"
echo "=================================================="

# Verificar se o arquivo .env já existe
if [ -f ".env" ]; then
    echo "⚠️  Arquivo .env já existe!"
    read -p "Deseja sobrescrever? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operação cancelada"
        exit 1
    fi
fi

# Função para obter input do usuário
get_input() {
    local prompt="$1"
    local default="$2"
    local secret="$3"
    
    if [ "$secret" = "true" ]; then
        read -s -p "$prompt [$default]: " value
        echo
    else
        read -p "$prompt [$default]: " value
    fi
    
    echo "${value:-$default}"
}

echo ""
echo "📋 Configurações da Aplicação"
echo "-----------------------------"

NODE_ENV=$(get_input "Ambiente (development/production/test)" "development")
PORT=$(get_input "Porta da aplicação" "3000")

echo ""
echo "🗄️  Configurações do Banco de Dados"
echo "-----------------------------------"

DB_HOST=$(get_input "Host do banco de dados" "localhost")
DB_PORT=$(get_input "Porta do banco de dados" "5432")
DB_USERNAME=$(get_input "Usuário do banco" "postgres")
DB_PASSWORD=$(get_input "Senha do banco" "password" "true")
DB_NAME=$(get_input "Nome do banco" "pedidos_db")

echo ""
echo "📨 Configurações do Kafka"
echo "-------------------------"

KAFKA_CLIENT_ID=$(get_input "ID do cliente Kafka" "meu-paozin-api")
KAFKA_BROKERS=$(get_input "Brokers do Kafka (separados por vírgula)" "localhost:9092")
KAFKA_GROUP_ID=$(get_input "ID do grupo Kafka" "meu-paozin-group")
KAFKA_CONSUMER_GROUP_ID=$(get_input "ID do grupo consumidor" "meu-paozin-consumer-group")

echo ""
echo "🔐 Configurações de Segurança (Opcional)"
echo "----------------------------------------"

read -p "Configurar JWT? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    JWT_SECRET=$(get_input "Chave secreta do JWT" "your-super-secret-jwt-key-change-in-production" "true")
    JWT_EXPIRES_IN=$(get_input "Expiração do JWT" "1d")
    JWT_REFRESH_SECRET=$(get_input "Chave de refresh" "your-super-secret-refresh-key-change-in-production" "true")
    JWT_REFRESH_EXPIRES_IN=$(get_input "Expiração do refresh" "7d")
else
    JWT_SECRET=""
    JWT_EXPIRES_IN=""
    JWT_REFRESH_SECRET=""
    JWT_REFRESH_EXPIRES_IN=""
fi

echo ""
echo "📊 Configurações de Log"
echo "----------------------"

LOG_LEVEL=$(get_input "Nível de log (debug/info/warn/error)" "debug")

echo ""
echo "🌐 Configurações de CORS"
echo "----------------------"

CORS_ORIGIN=$(get_input "Origem permitida (use * para desenvolvimento)" "*")

echo ""
echo "🔧 Configurações do Context7 (Opcional)"
echo "---------------------------------------"

read -p "Configurar Context7? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    CONTEXT7_API_KEY=$(get_input "Chave da API Context7" "" "true")
    CONTEXT7_BASE_URL=$(get_input "URL base do Context7" "https://api.context7.com")
    CONTEXT7_TIMEOUT=$(get_input "Timeout da API (ms)" "30000")
else
    CONTEXT7_API_KEY=""
    CONTEXT7_BASE_URL="https://api.context7.com"
    CONTEXT7_TIMEOUT="30000"
fi

# Criar arquivo .env
echo ""
echo "📝 Criando arquivo .env..."
echo ""

cat > .env << EOF
# =============================================================================
# CONFIGURAÇÕES DA APLICAÇÃO
# =============================================================================
NODE_ENV=${NODE_ENV}
PORT=${PORT}
API_PREFIX=api
API_VERSION=v1

# =============================================================================
# CONFIGURAÇÕES DO BANCO DE DADOS POSTGRESQL
# =============================================================================
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
DB_SYNCHRONIZE=$([ "$NODE_ENV" = "production" ] && echo "false" || echo "true")
DB_LOGGING=$([ "$NODE_ENV" = "production" ] && echo "false" || echo "true")
DB_SSL=$([ "$NODE_ENV" = "production" ] && echo "true" || echo "false")

# =============================================================================
# CONFIGURAÇÕES DO KAFKA
# =============================================================================
KAFKA_CLIENT_ID=${KAFKA_CLIENT_ID}
KAFKA_BROKERS=${KAFKA_BROKERS}
KAFKA_GROUP_ID=${KAFKA_GROUP_ID}
KAFKA_CONSUMER_GROUP_ID=${KAFKA_CONSUMER_GROUP_ID}
KAFKA_RETRY_INITIAL_RETRY_TIME=100
KAFKA_RETRY_RETRIES=8

# =============================================================================
# CONFIGURAÇÕES DO ZOOKEEPER (para Kafka)
# =============================================================================
ZOOKEEPER_CLIENT_PORT=2181
ZOOKEEPER_TICK_TIME=2000

# =============================================================================
# CONFIGURAÇÕES DO SWAGGER/DOCUMENTAÇÃO
# =============================================================================
SWAGGER_TITLE=MeuPaoZin API
SWAGGER_DESCRIPTION=API para gerenciamento de pedidos de pães
SWAGGER_VERSION=2.0.0
SWAGGER_PATH=api/docs

# =============================================================================
# CONFIGURAÇÕES DE SEGURANÇA
# =============================================================================
EOF

# Adicionar configurações JWT se fornecidas
if [ -n "$JWT_SECRET" ]; then
    cat >> .env << EOF
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=${JWT_EXPIRES_IN}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_REFRESH_EXPIRES_IN=${JWT_REFRESH_EXPIRES_IN}
EOF
else
    cat >> .env << EOF
# JWT_SECRET=your-super-secret-jwt-key-change-in-production
# JWT_EXPIRES_IN=1d
# JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
# JWT_REFRESH_EXPIRES_IN=7d
EOF
fi

cat >> .env << EOF

# =============================================================================
# CONFIGURAÇÕES DE LOG
# =============================================================================
LOG_LEVEL=${LOG_LEVEL}
LOG_FORMAT=combined
LOG_COLORIZE=true

# =============================================================================
# CONFIGURAÇÕES DE CORS
# =============================================================================
CORS_ORIGIN=${CORS_ORIGIN}
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE
CORS_CREDENTIALS=true

# =============================================================================
# CONFIGURAÇÕES DO CONTEXT7 (opcional)
# =============================================================================
CONTEXT7_API_KEY=${CONTEXT7_API_KEY}
CONTEXT7_BASE_URL=${CONTEXT7_BASE_URL}
CONTEXT7_TIMEOUT=${CONTEXT7_TIMEOUT}

# =============================================================================
# CONFIGURAÇÕES DE VALIDAÇÃO
# =============================================================================
VALIDATION_WHITELIST=true
VALIDATION_FORBID_NON_WHITELISTED=true
VALIDATION_TRANSFORM=true

# =============================================================================
# CONFIGURAÇÕES DE TESTE
# =============================================================================
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_USERNAME=postgres
TEST_DB_PASSWORD=password
TEST_DB_NAME=pedidos_test_db

# =============================================================================
# CONFIGURAÇÕES DE DOCKER (para desenvolvimento local)
# =============================================================================
DOCKER_COMPOSE_FILE=docker-compose.yml
DOCKER_NETWORK=meupaozin-network
EOF

echo "✅ Arquivo .env criado com sucesso!"
echo ""
echo "🔧 Próximos passos:"
echo "1. Execute: npm install"
echo "2. Execute: npm run docker:up"
echo "3. Execute: npm run setup:complete"
echo ""
echo "📚 Documentação disponível em: docs/ENV-SETUP.md"
echo ""
echo "🚀 Sistema pronto para desenvolvimento!" 