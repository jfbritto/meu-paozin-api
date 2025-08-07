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

# Kafka
KAFKA_CLIENT_ID=meu-paozin-api
KAFKA_BROKERS=localhost:9092
KAFKA_GROUP_ID=meu-paozin-group
KAFKA_CONSUMER_GROUP_ID=meu-paozin-consumer-group
```

### Setup Completo

O comando `npm run setup:complete` irá:
1. Iniciar todos os containers (PostgreSQL + Kafka + Zookeeper)
2. Aguardar o Kafka estar pronto
3. Criar os tópicos necessários
4. Inserir dados de exemplo

### Setup Manual

```bash
# 1. Iniciar containers
npm run docker:up

# 2. Aguardar Kafka estar pronto (30s)
sleep 30

# 3. Criar tópicos Kafka
npm run kafka:init-topics

# 4. Inserir dados de exemplo
npm run docker:seed
```

## 🚀 Como Usar

### Acessos

- **API**: http://localhost:3000
- **Swagger**: http://localhost:3000/api
- **Kafka UI**: http://localhost:8080
- **Observabilidade**: http://localhost:3000/api/observability/health

### Comandos Úteis

```bash
# Ver status dos containers
npm run docker:status

# Ver logs da aplicação
npm run docker:logs

# Ver logs do Kafka
npm run kafka:logs

# Abrir Kafka UI
npm run kafka:ui

# Testar eventos Kafka
npm run kafka:test

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

## 📊 Eventos Kafka

### Tópicos Implementados

| Tópico | Descrição | Eventos |
|--------|-----------|---------|
| `pedidos.created` | Pedidos criados | PEDIDO_CREATED |
| `pedidos.updated` | Pedidos atualizados | PEDIDO_UPDATED |
| `pedidos.status-changed` | Mudanças de status | PEDIDO_STATUS_CHANGED |
| `pedidos.cancelled` | Pedidos cancelados | PEDIDO_CANCELLED |
| `clientes.created` | Clientes criados | CLIENTE_CREATED |
| `tipos-pao.updated` | Tipos de pão atualizados | TIPO_PAO_UPDATED |
| `analytics.events` | Eventos de analytics | Vários tipos |

### Exemplo de Evento

```json
{
  "eventType": "PEDIDO_CREATED",
  "pedidoId": 1,
  "clienteId": 1,
  "tipoPaoId": 1,
  "quantidade": 5,
  "precoTotal": 17.50,
  "statusId": 1,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔧 Desenvolvimento

### Estrutura do Projeto

```
src/
├── kafka/                 # Módulo Kafka
│   ├── kafka.module.ts
│   ├── kafka.service.ts
│   ├── kafka-producer.service.ts
│   └── kafka-consumer.service.ts
├── pedidos/              # Módulo de Pedidos
├── clientes/             # Módulo de Clientes
├── tipos-pao/            # Módulo de Tipos de Pão
└── status-pedido/        # Módulo de Status
```

### Adicionando Novos Eventos

1. **Criar método no KafkaProducerService**:
```typescript
async sendNovoEvento(data: any): Promise<void> {
  await this.sendEvent({
    topic: 'novo.topic',
    key: `novo-${data.id}`,
    value: {
      eventType: 'NOVO_EVENTO',
      ...data,
      timestamp: new Date().toISOString(),
    },
  });
}
```

2. **Criar handler no KafkaConsumerService**:
```typescript
this.registerHandler({
  topic: 'novo.topic',
  handler: async (message) => {
    console.log('Novo evento processado:', message);
    // Implementar lógica
  },
});
```

3. **Chamar no serviço**:
```typescript
await this.kafkaProducer.sendNovoEvento(data);
```

## 📈 Monitoramento

### Logs

O sistema registra logs detalhados:
- ✅ Conexões bem-sucedidas
- ❌ Erros de conexão
- 📤 Eventos enviados
- 📨 Mensagens recebidas

### Kafka UI

Acesse http://localhost:8080 para:
- Visualizar tópicos
- Ver mensagens em tempo real
- Monitorar configurações

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

2. **Tópicos não criados**
   ```bash
   npm run kafka:init-topics
   # Aguardar Kafka estar pronto
   ```

3. **Aplicação não inicia**
   ```bash
   npm run docker:logs
   # Verificar logs da aplicação
   ```

### Debug

```bash
# Ver status dos containers
docker-compose ps

# Ver logs específicos
docker-compose logs -f app
docker-compose logs -f kafka

# Reiniciar tudo
npm run docker:restart
```

## 📚 Documentação

- [Configuração de Variáveis de Ambiente](./docs/ENV-SETUP.md)
- [Implementação do Datadog](./docs/DATADOG-IMPLEMENTATION.md)
- [Integração Kafka](./docs/KAFKA-INTEGRATION.md)
- [Análise de Bibliotecas](./docs/libs/README.md)
- [Swagger API](./docs/SWAGGER.md)

## 🔄 CI/CD (GitHub Actions)

O projeto inclui um pipeline completo de CI/CD configurado no GitHub Actions:

### Workflow Incluído

- **Testes**: Unitários e E2E com PostgreSQL e Kafka
- **Build**: Compilação e validação da aplicação
- **Docker**: Build e push de imagens
- **Segurança**: Análise com Snyk e npm audit
- **Deploy**: Staging e Produção

### Secrets Necessários

Configure os seguintes secrets no seu repositório:

- `DOCKER_USERNAME`: Usuário do Docker Hub
- `DOCKER_PASSWORD`: Senha do Docker Hub
- `SNYK_TOKEN`: Token do Snyk (opcional)

### Execução

O pipeline é executado automaticamente em:
- Push para `main` e `develop`
- Pull Requests para `main` e `develop`

## 🚀 Próximos Passos

### Implementações Futuras

- [ ] Dead Letter Queue para mensagens falhadas
- [ ] Retry Policy para mensagens
- [ ] Schema Registry para validação
- [ ] Streaming Analytics
- [ ] Integração com sistemas externos

### Melhorias

- [ ] Compressão de mensagens
- [ ] Partitioning avançado
- [ ] Replicação para alta disponibilidade
- [ ] Segurança (SASL/SSL)

## 📄 Licença

Este projeto é para fins educacionais.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

**Desenvolvido para estudo de integração Kafka com NestJS** 🚀
