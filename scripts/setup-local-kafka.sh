#!/bin/bash

# Script para configurar Kafka local para desenvolvimento
echo "🚀 Configurando Kafka local para desenvolvimento..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Iniciar apenas Kafka e Zookeeper
echo "🐳 Iniciando Kafka e Zookeeper..."
docker-compose up -d zookeeper kafka

# Aguardar Kafka estar pronto
echo "⏳ Aguardando Kafka estar pronto..."
sleep 30

# Criar tópicos
echo "📝 Criando tópicos do Kafka..."
./scripts/init-kafka-topics.sh

echo "✅ Kafka local configurado com sucesso!"
echo "📊 Kafka UI disponível em: http://localhost:8080"
echo "🔧 Para iniciar a aplicação: npm run start:dev" 