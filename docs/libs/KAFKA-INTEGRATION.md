# Integração Kafka no Sistema MeuPaoZin

## Visão Geral

Esta documentação descreve a integração do Apache Kafka no sistema MeuPaoZin para melhorar o fluxo de dados e permitir processamento assíncrono de eventos.

## Arquitetura

### Componentes Kafka

1. **KafkaService**: Serviço principal que gerencia a configuração e conexão com o Kafka
2. **KafkaProducerService**: Responsável por enviar eventos para tópicos específicos
3. **KafkaConsumerService**: Processa mensagens recebidas dos tópicos

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

## Fluxo de Eventos

### 1. Criação de Pedidos

```typescript
// Quando um pedido é criado
await this.kafkaProducer.sendPedidoCreated(pedido);
await this.kafkaProducer.sendAnalyticsEvent({
  eventType: 'PEDIDO_CREATED_ANALYTICS',
  // ... dados do pedido
});
```

**Eventos disparados:**
- Notificação para o cliente
- Atualização de dashboard em tempo real
- Registro em sistema de analytics

### 2. Atualização de Status

```typescript
// Quando o status de um pedido muda
await this.kafkaProducer.sendPedidoStatusChanged(pedido, previousStatus);
```

**Eventos disparados:**
- Notificação para o cliente sobre mudança de status
- Atualização de dashboard
- Integração com sistema de delivery

### 3. Cancelamento de Pedidos

```typescript
// Quando um pedido é cancelado
await this.kafkaProducer.sendPedidoCancelled(pedido);
```

**Eventos disparados:**
- Notificação de cancelamento
- Reembolso automático
- Registro de motivo do cancelamento

## Configuração

### Variáveis de Ambiente

```env
KAFKA_BROKERS=kafka:9092
KAFKA_CLIENT_ID=meupaozin-api
KAFKA_CONSUMER_GROUP_ID=meupaozin-consumer-group
```

### Docker Compose

O sistema inclui:
- **Zookeeper**: Necessário para coordenação do Kafka
- **Kafka**: Broker de mensagens
- **Kafka UI**: Interface web para visualizar tópicos e mensagens

## Como Usar

### 1. Iniciar o Sistema Completo

```bash
npm run setup:complete
```

Este comando:
1. Inicia todos os containers (PostgreSQL, Kafka, Zookeeper)
2. Aguarda o Kafka estar pronto
3. Cria os tópicos necessários
4. Insere dados de exemplo

### 2. Comandos Úteis

```bash
# Ver logs do Kafka
npm run kafka:logs

# Abrir Kafka UI
npm run kafka:ui

# Inicializar apenas tópicos
npm run kafka:init-topics
```

### 3. Acessar Kafka UI

Abra http://localhost:8080 para visualizar:
- Tópicos criados
- Mensagens em tempo real
- Configurações do cluster

## Casos de Uso Implementados

### 1. Notificações em Tempo Real

Quando um pedido é criado ou seu status muda, o sistema pode:
- Enviar notificação push para o cliente
- Atualizar dashboard em tempo real
- Integrar com sistemas externos

### 2. Analytics e Relatórios

Todos os eventos são enviados para o tópico `analytics.events` para:
- Geração de relatórios
- Machine learning para previsões
- Dashboard em tempo real

### 3. Integração Externa

O Kafka permite integração com:
- Sistemas de pagamento
- Sistemas de delivery
- CRMs
- Sistemas de marketing

## Estrutura de Mensagens

### Exemplo: Pedido Criado

```json
{
  "eventType": "PEDIDO_CREATED",
  "pedidoId": 1,
  "clienteId": 1,
  "tipoPaoId": 1,
  "quantidade": 5,
  "precoTotal": 17.50,
  "statusId": 1,
  "dataPedido": "2024-01-15T10:30:00.000Z",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Exemplo: Mudança de Status

```json
{
  "eventType": "PEDIDO_STATUS_CHANGED",
  "pedidoId": 1,
  "clienteId": 1,
  "previousStatusId": 1,
  "newStatusId": 2,
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

## Monitoramento

### Logs

O sistema registra logs detalhados:
- ✅ Conexões bem-sucedidas
- ❌ Erros de conexão
- 📤 Eventos enviados
- 📨 Mensagens recebidas

### Métricas

Você pode monitorar:
- Taxa de mensagens por segundo
- Latência de processamento
- Tamanho das filas
- Erros de processamento

## Próximos Passos

### 1. Implementações Futuras

- **Dead Letter Queue**: Para mensagens que falharam
- **Retry Policy**: Política de retry para mensagens
- **Schema Registry**: Validação de schemas
- **Streaming Analytics**: Processamento em tempo real

### 2. Melhorias

- **Compressão**: Reduzir tamanho das mensagens
- **Partitioning**: Melhor distribuição de carga
- **Replicação**: Alta disponibilidade
- **Security**: Autenticação e autorização

### 3. Integrações

- **Sistema de Pagamento**: Para processar pagamentos
- **Sistema de Delivery**: Para rastreamento
- **CRM**: Para gestão de clientes
- **Marketing**: Para campanhas personalizadas

## Troubleshooting

### Problemas Comuns

1. **Kafka não conecta**
   - Verificar se o container está rodando
   - Verificar logs: `npm run kafka:logs`

2. **Tópicos não criados**
   - Executar: `npm run kafka:init-topics`
   - Verificar se o Kafka está pronto

3. **Mensagens não processadas**
   - Verificar logs da aplicação
   - Verificar configuração do consumer group

### Comandos de Debug

```bash
# Ver status dos containers
docker-compose ps

# Ver logs da aplicação
docker-compose logs -f app

# Ver logs do Kafka
docker-compose logs -f kafka

# Acessar Kafka UI
open http://localhost:8080
```

## Conclusão

A integração do Kafka no sistema MeuPaoZin permite:
- Processamento assíncrono de eventos
- Escalabilidade horizontal
- Integração com sistemas externos
- Analytics em tempo real
- Notificações em tempo real

Esta arquitetura prepara o sistema para crescimento futuro e integrações mais complexas. 