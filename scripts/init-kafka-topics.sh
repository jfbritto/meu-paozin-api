#!/bin/bash

# Script para inicializar tópicos do Kafka
# Este script deve ser executado após o Kafka estar rodando

echo "🚀 Inicializando tópicos do Kafka..."

# Aguardar o Kafka estar pronto
echo "⏳ Aguardando Kafka estar pronto..."
sleep 30

# Função para criar tópico
create_topic() {
    local topic_name=$1
    local partitions=${2:-3}
    local replication=${3:-1}
    
    echo "📝 Criando tópico: $topic_name"
    docker exec meupaozin-kafka kafka-topics \
        --create \
        --topic "$topic_name" \
        --bootstrap-server localhost:9092 \
        --partitions "$partitions" \
        --replication-factor "$replication" \
        --if-not-exists
}

# ===== TÓPICOS DE PEDIDOS =====
create_topic "pedidos.created"
create_topic "pedidos.updated"
create_topic "pedidos.status-changed"
create_topic "pedidos.cancelled"

# ===== TÓPICOS DE CLIENTES =====
create_topic "clientes.created"
create_topic "clientes.updated"
create_topic "clientes.deleted"

# ===== TÓPICOS DE TIPOS DE PÃO =====
create_topic "tipos-pao.created"
create_topic "tipos-pao.updated"
create_topic "tipos-pao.deleted"

# ===== TÓPICOS DE ANALYTICS =====
create_topic "analytics.events"

# ===== TÓPICOS DE NOTIFICAÇÕES =====
create_topic "notifications.events"

# ===== TÓPICOS DE AUDITORIA =====
create_topic "audit.events"

echo "✅ Tópicos do Kafka criados com sucesso!"
echo "📊 Você pode acessar o Kafka UI em: http://localhost:8080" 