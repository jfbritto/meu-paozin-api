#!/bin/bash

echo "=== DIAGNÓSTICO KAFKA ==="

# 1. Verificar se Kafka está rodando
echo "1. Verificando processos Kafka..."
ps aux | grep kafka | grep -v grep

# 2. Verificar portas
echo "2. Verificando porta 9092..."
netstat -tlnp | grep 9092

# 3. Verificar Docker (se estiver usando)
echo "3. Verificando containers Docker..."
docker ps | grep kafka

# 4. Testar conectividade
echo "4. Testando conectividade..."
nc -zv localhost 9092

# 5. Verificar logs da aplicação
echo "5. Verificando logs da aplicação..."
pm2 logs meupaozin-api --lines 10 | grep -i kafka

# 6. Verificar configuração
echo "6. Verificando configuração..."
if [ -f "/var/www/meupaozin/backend/.env" ]; then
    echo "Variáveis Kafka no .env:"
    cat /var/www/meupaozin/backend/.env | grep -i kafka
else
    echo "Arquivo .env não encontrado"
fi

# 7. Tentar iniciar Kafka se não estiver rodando
echo "7. Tentando iniciar Kafka..."
if ! nc -z localhost 9092; then
    echo "Kafka não está rodando. Tentando iniciar..."
    
    # Se estiver usando Docker
    if command -v docker &> /dev/null; then
        cd /var/www/meupaozin/backend
        docker-compose up -d kafka
        sleep 5
        echo "Kafka iniciado via Docker"
    else
        echo "Docker não encontrado. Verifique se Kafka está instalado nativamente."
    fi
else
    echo "Kafka já está rodando na porta 9092"
fi

# 8. Verificar novamente
echo "8. Verificação final..."
nc -zv localhost 9092

echo "=== DIAGNÓSTICO CONCLUÍDO ===" 