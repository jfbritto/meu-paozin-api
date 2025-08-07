# MeuPaoZin API

API para gerenciamento de pedidos de pães com integração Kafka para processamento de eventos em tempo real.

## 🚀 Funcionalidades

- **Gestão de Clientes**: CRUD completo de clientes
- **Gestão de Tipos de Pão**: CRUD de tipos de pão com preços
- **Gestão de Status de Pedidos**: Estados como Pendente, Em Preparo, Pronto, etc.
- **Gestão de Pedidos**: CRUD de pedidos com relacionamentos
- **Integração Kafka**: Processamento assíncrono de eventos
- **Notificações em Tempo Real**: Eventos para dashboards e sistemas externos
- **Analytics**: Coleta de dados para relatórios e análises

## 🏗️ Arquitetura

### Componentes

- **NestJS**: Framework backend
- **PostgreSQL**: Banco de dados principal
- **Kafka**: Sistema de mensageria para eventos
- **Zookeeper**: Coordenação do Kafka
- **Kafka UI**: Interface web para visualizar tópicos

### Fluxo de Eventos

```
Cliente faz pedido → API cria pedido → Kafka envia evento → 
Sistemas processam evento → Notificações enviadas → 
Dashboard atualizado → Analytics processados
```

## 🛠️ Tecnologias

- **Backend**: NestJS, TypeScript
- **Banco de Dados**: PostgreSQL, TypeORM
- **Mensageria**: Apache Kafka
- **Documentação**: Swagger/OpenAPI
- **Containerização**: Docker, Docker Compose

## 📦 Instalação

### Pré-requisitos

- Docker e Docker Compose
- Node.js 18+
- npm ou yarn

### Configuração Inicial

#### Opção 1: Setup Automático (Recomendado)

```bash
# Clone o repositório
git clone <repository-url>
cd meu-paozin-api

# Execute o script de configuração
./scripts/setup-env.sh

# Instale as dependências
npm install

# Inicie o sistema completo
npm run setup:complete
```

#### Opção 2: Setup Manual

```bash
# Clone o repositório
git clone <repository-url>
cd meu-paozin-api

# Copie o arquivo de configuração
cp env-complete.txt .env

# Edite as variáveis conforme necessário
nano .env

# Instale as dependências
npm install

# Inicie o sistema completo
npm run setup:complete
```

### Variáveis de Ambiente

O sistema utiliza várias variáveis de ambiente para configuração. Veja a documentação completa em [docs/ENV-SETUP.md](./docs/ENV-SETUP.md).

#### Variáveis Obrigatórias

```bash
# Aplicação
NODE_ENV=development
PORT=3000

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=pedidos_db
```

### Setup Completo

O comando `npm run setup:complete` irá:
1. Iniciar todos os containers (PostgreSQL)
2. Inserir dados de exemplo

### Setup Manual

```bash
# 1. Iniciar containers
npm run docker:up

# 2. Inserir dados de exemplo
npm run docker:seed
```

## 🚀 Como Usar

### Acessos

- **API**: http://localhost:3000
- **Swagger**: http://localhost:3000/api
- **Observabilidade**: http://localhost:3000/api/observability/health

### Comandos Úteis

```bash
# Ver status dos containers
npm run docker:status

# Ver logs da aplicação
npm run docker:logs

# Gerenciar Datadog
npm run datadog:up
npm run datadog:down
npm run datadog:logs
npm run datadog:status

# Parar todos os containers
npm run docker:down

# Limpar tudo (volumes incluídos)
npm run docker:clean
```

## 🔧 Desenvolvimento

### Estrutura do Projeto

```
src/
├── modules/              # Módulos da aplicação
│   ├── pedidos/         # Módulo de Pedidos
│   ├── clientes/        # Módulo de Clientes
│   └── tipos-pao/       # Módulo de Tipos de Pão
├── infrastructure/       # Infraestrutura
│   └── database/        # Configurações do banco
├── config/              # Configurações
└── shared/              # Utilitários compartilhados
```

## 📈 Monitoramento

### Logs

O sistema registra logs detalhados:
- ✅ Operações bem-sucedidas
- ❌ Erros de operação
- 📤 Requisições processadas

## 🧪 Testes

### Teste de Eventos Kafka

```bash
npm run kafka:test
```

Este script irá:
1. Criar um cliente
2. Criar um pedido
3. Atualizar status do pedido
4. Atualizar tipo de pão
5. Remover pedido

### Verificando Eventos

1. Execute o teste: `npm run kafka:test`
2. Abra o Kafka UI: `npm run kafka:ui`
3. Verifique os tópicos e mensagens

## 🔍 Troubleshooting

### Problemas Comuns

1. **Kafka não conecta**
   ```bash
   npm run kafka:logs
   # Verificar se o container está rodando
   ```