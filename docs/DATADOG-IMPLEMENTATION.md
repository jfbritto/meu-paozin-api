# Implementação do Datadog - Observabilidade Completa

## 📋 Visão Geral

Implementei uma solução completa de observabilidade usando o Datadog para o sistema MeuPaoZin API. A implementação inclui APM (Application Performance Monitoring), métricas customizadas, logs estruturados e traces distribuídos.

## 🏗️ Arquitetura da Observabilidade

### Componentes Implementados

1. **DatadogService**: Serviço principal para gerenciar traces, métricas e eventos
2. **DatadogInterceptor**: Interceptor para capturar automaticamente requisições HTTP
3. **DatadogMiddleware**: Middleware para adicionar headers de trace
4. **DatadogDecoratorInterceptor**: Interceptor para processar decorators customizados
5. **DatadogController**: Controller para health checks e testes de observabilidade

## 🔧 Funcionalidades Implementadas

### 1. APM (Application Performance Monitoring)

- **Traces Automáticos**: Captura automática de todas as requisições HTTP
- **Spans Customizados**: Criação de spans para operações específicas
- **Distributed Tracing**: Rastreamento distribuído entre serviços
- **Performance Metrics**: Métricas de latência, throughput e erro

### 2. Métricas Customizadas

- **HTTP Request Metrics**: Contagem e duração de requisições
- **Business Metrics**: Métricas de negócio (pedidos criados, etc.)
- **Error Metrics**: Contagem de erros por tipo
- **Custom Metrics**: Métricas específicas da aplicação

### 3. Logs Estruturados

- **Log Injection**: Injeção de trace IDs nos logs
- **Structured Logging**: Logs em formato JSON
- **Error Tracking**: Rastreamento detalhado de erros
- **Request Logging**: Logs de todas as requisições

### 4. Eventos Customizados

- **Business Events**: Eventos de negócio (pedido criado, etc.)
- **System Events**: Eventos do sistema
- **Error Events**: Eventos de erro
- **Performance Events**: Eventos de performance

## 📁 Estrutura de Arquivos

```
src/infrastructure/observability/datadog/
├── datadog.module.ts              # Módulo principal
├── datadog.service.ts             # Serviço principal
├── datadog.interceptor.ts         # Interceptor HTTP
├── datadog.middleware.ts          # Middleware
├── datadog-decorator.interceptor.ts # Interceptor de decorators
├── datadog.decorator.ts           # Decorators customizados
└── datadog.controller.ts          # Controller de health check
```

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# Datadog Configuration
DD_SERVICE_NAME=meu-paozin-api
DD_ENV=development
DD_VERSION=1.0.0
DD_TRACE_ENABLED=true
DD_AGENT_HOST=localhost
DD_AGENT_PORT=8126
DD_LOGS_ENABLED=true
DD_PROFILING_ENABLED=true
DD_RUNTIME_METRICS_ENABLED=true
DD_ANALYTICS_ENABLED=true
DD_LOG_INJECTION=true
DD_REPORT_HOSTNAME=true
```

### Docker Compose

```yaml
# Datadog Agent
datadog-agent:
  image: datadog/agent:latest
  environment:
    - DD_API_KEY=${DD_API_KEY}
    - DD_APM_ENABLED=true
    - DD_APM_NON_LOCAL_TRAFFIC=true
  ports:
    - "8126:8126"  # APM
    - "8125:8125/udp"  # StatsD
```

## 🚀 Como Usar

### 1. Setup Completo com Datadog

```bash
# Setup completo incluindo Datadog
npm run setup:full

# Ou passo a passo
npm run datadog:up
npm run docker:up
npm run kafka:init-topics
npm run docker:seed
```

### 2. Verificar Status do Datadog

```bash
# Health check do Datadog
curl http://localhost:3000/api/observability/health

# Testar métricas
curl http://localhost:3000/api/observability/metrics

# Testar eventos
curl http://localhost:3000/api/observability/events
```

### 3. Comandos de Gerenciamento

```bash
# Gerenciar Datadog Agent
npm run datadog:up
npm run datadog:down
npm run datadog:logs
npm run datadog:status
```

## 🎯 Decorators Customizados

### 1. @DatadogTrace

Cria um span customizado para uma operação:

```typescript
@DatadogTrace('pedido.create', { operation: 'create_pedido' })
async create(@Body() createPedidoDto: CreatePedidoDto): Promise<Pedido> {
  return await this.pedidosService.create(createPedidoDto);
}
```

### 2. @DatadogMetrics

Envia métricas customizadas:

```typescript
@DatadogMetrics(
  { name: 'pedido.created', value: 1, tags: { operation: 'create' } }
)
async create(@Body() createPedidoDto: CreatePedidoDto): Promise<Pedido> {
  return await this.pedidosService.create(createPedidoDto);
}
```

### 3. @DatadogEvents

Envia eventos customizados:

```typescript
@DatadogEvents(
  { name: 'pedido.created', attributes: { operation: 'create_pedido' } }
)
async create(@Body() createPedidoDto: CreatePedidoDto): Promise<Pedido> {
  return await this.pedidosService.create(createPedidoDto);
}
```

## 📊 Métricas Capturadas Automaticamente

### HTTP Metrics

- `http.request.duration`: Duração das requisições
- `http.request.count`: Contagem de requisições
- `http.request.error`: Contagem de erros
- `http.status_code`: Códigos de status
- `http.method`: Métodos HTTP
- `http.endpoint`: Endpoints acessados

### Business Metrics

- `pedido.created`: Pedidos criados
- `pedido.updated`: Pedidos atualizados
- `pedido.recentes.accessed`: Acesso a pedidos recentes
- `kafka.event.sent`: Eventos Kafka enviados
- `kafka.event.received`: Eventos Kafka recebidos

### System Metrics

- `health.check`: Health checks
- `error.count`: Contagem de erros
- `performance.latency`: Latência de operações

## 🔍 Traces e Spans

### Spans Automáticos

1. **HTTP Request Spans**: Criados automaticamente para todas as requisições
2. **Database Spans**: Spans para operações de banco de dados
3. **Kafka Spans**: Spans para operações de mensageria
4. **Custom Spans**: Spans criados manualmente

### Informações Capturadas

- **Request ID**: ID único para cada requisição
- **User Agent**: Informações do cliente
- **Response Size**: Tamanho da resposta
- **Duration**: Duração da operação
- **Error Details**: Detalhes de erros
- **Custom Tags**: Tags customizadas

## 📈 Dashboards Sugeridos

### 1. Performance Dashboard

- **Latência**: P95, P99 das requisições
- **Throughput**: Requisições por segundo
- **Error Rate**: Taxa de erro
- **Response Time**: Tempo de resposta por endpoint

### 2. Business Dashboard

- **Pedidos**: Pedidos criados/atualizados por hora
- **Clientes**: Novos clientes
- **Produtos**: Tipos de pão mais vendidos
- **Revenue**: Receita por período

### 3. System Dashboard

- **CPU/Memory**: Uso de recursos
- **Database**: Performance do PostgreSQL
- **Kafka**: Performance do Kafka
- **Errors**: Erros por tipo

## 🛠️ Troubleshooting

### Problemas Comuns

1. **Datadog Agent não conecta**
   ```bash
   # Verificar se o agent está rodando
   npm run datadog:status
   
   # Ver logs do agent
   npm run datadog:logs
   ```

2. **Traces não aparecem**
   ```bash
   # Verificar configuração
   curl http://localhost:3000/api/observability/health
   
   # Verificar se DD_TRACE_ENABLED=true
   ```

3. **Métricas não são enviadas**
   ```bash
   # Testar métricas
   curl http://localhost:3000/api/observability/metrics
   
   # Verificar logs da aplicação
   npm run docker:logs
   ```

### Debug

```bash
# Verificar status do Datadog
curl http://localhost:3000/api/observability/health

# Ver logs do Datadog Agent
docker-compose -f docker-compose.datadog.yml logs datadog-agent

# Ver logs da aplicação
docker-compose logs app
```

## 🔐 Segurança

### Variáveis Sensíveis

- `DD_API_KEY`: Chave da API do Datadog
- `DD_ENV`: Ambiente (development/production)
- `DD_SERVICE_NAME`: Nome do serviço

### Recomendações

1. **Nunca commite a API key** no repositório
2. **Use variáveis de ambiente** em produção
3. **Configure rate limiting** para evitar sobrecarga
4. **Monitore o uso** do Datadog
5. **Configure alertas** apropriados

## 📚 Integração com Outras Ferramentas

### 1. Logs

O Datadog captura automaticamente:
- Logs da aplicação
- Logs do Docker
- Logs do sistema

### 2. Métricas

Métricas disponíveis:
- Métricas do sistema
- Métricas de aplicação
- Métricas customizadas

### 3. Traces

Traces distribuídos:
- HTTP requests
- Database queries
- Kafka operations
- Custom operations

## 🎯 Próximos Passos

### Implementações Futuras

1. **Alertas Automáticos**
   - Configurar alertas para latência alta
   - Alertas para taxa de erro
   - Alertas para métricas de negócio

2. **Métricas Avançadas**
   - Métricas de negócio mais detalhadas
   - SLOs (Service Level Objectives)
   - SLIs (Service Level Indicators)

3. **Integração com CI/CD**
   - Deploy automático de dashboards
   - Testes de performance
   - Monitoramento de deploys

4. **Observabilidade Avançada**
   - Log correlation
   - Error tracking
   - Performance profiling

## 📝 Exemplo de Uso Completo

```typescript
@Controller('pedidos')
export class PedidosController {
  @Post()
  @DatadogTrace('pedido.create', { operation: 'create_pedido' })
  @DatadogMetrics(
    { name: 'pedido.created', value: 1, tags: { operation: 'create' } }
  )
  @DatadogEvents(
    { name: 'pedido.created', attributes: { operation: 'create_pedido' } }
  )
  async create(@Body() createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    return await this.pedidosService.create(createPedidoDto);
  }
}
```

## 🔗 Links Úteis

- [Documentação Datadog APM](https://docs.datadoghq.com/tracing/)
- [Datadog Node.js](https://docs.datadoghq.com/tracing/setup_overview/setup/nodejs/)
- [Datadog Docker](https://docs.datadoghq.com/agent/docker/)
- [Datadog Metrics](https://docs.datadoghq.com/developers/metrics/)

---

**Implementado em**: 2025-08-06
**Versão**: 1.0.0
**Status**: ✅ Funcionando 