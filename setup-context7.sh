#!/bin/bash

echo "🚀 Configurando Context7 MCP Server..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não está instalado. Por favor, instale o npm primeiro."
    exit 1
fi

# Testar se o servidor MCP do Context7 está funcionando
echo "📦 Testando servidor MCP do Context7..."
npx @upstash/context7-mcp --help > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Servidor MCP do Context7 está funcionando!"
else
    echo "❌ Erro ao testar o servidor MCP do Context7"
    exit 1
fi

# Verificar se a variável de ambiente está configurada
if [ -z "$CONTEXT7_API_KEY" ]; then
    echo "⚠️  Variável CONTEXT7_API_KEY não está configurada"
    echo "📝 Para configurar, adicione ao seu ~/.zshrc ou ~/.bashrc:"
    echo "export CONTEXT7_API_KEY='sua-chave-api-do-context7'"
    echo ""
    echo "🔑 Você pode obter sua chave API em: https://context7.com"
else
    echo "✅ Variável CONTEXT7_API_KEY está configurada"
fi

echo ""
echo "🎉 Configuração do Context7 concluída!"
echo "📋 Para usar o Context7 no Cursor:"
echo "   1. Reinicie o Cursor"
echo "   2. O servidor MCP do Context7 estará disponível"
echo "   3. Configure sua chave API se ainda não fez" 