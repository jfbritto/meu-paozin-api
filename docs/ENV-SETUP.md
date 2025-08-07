# Configuração de Variáveis de Ambiente - MeuPaoZin API

## 📋 Visão Geral

Este documento descreve todas as variáveis de ambiente necessárias para executar o sistema MeuPaoZin API em diferentes ambientes (desenvolvimento, produção, testes).

## 🏗️ Estrutura do Sistema

O sistema MeuPaoZin API utiliza:
- **NestJS** como framework principal
- **PostgreSQL** como banco de dados
- **Kafka** para mensageria
- **Docker** para containerização
- **TypeORM** para ORM
- **Swagger** para documentação da API

## 🔧 Variáveis de Ambiente

### Configurações da Aplicação

| Variável | Descrição | Padrão | Obrigatória |
|----------|-----------|--------|-------------|
| `NODE_ENV` | Ambiente de execução | `development` | ✅ |
| `PORT` | Porta da aplicação | `3000` | ✅ |
| `API_PREFIX` | Prefixo da API | `api` | ❌ |
| `API_VERSION` | Versão da API | `v1` | ❌ |

### Configurações do Banco de Dados (PostgreSQL)

| Variável | Descrição | Padrão | Obrigatória |
|----------|-----------|--------|-------------|
| `DB_HOST` | Host do banco de dados | `localhost` | ✅ |
| `DB_PORT` | Porta do banco de dados | `5432` | ✅ |
| `DB_USERNAME` | Usuário do banco | `postgres` | ✅ |
| `DB_PASSWORD` | Senha do banco | `password` | ✅ |
| `DB_NAME` | Nome do banco | `pedidos_db` | ✅ |
| `DB_SYNCHRONIZE` | Sincronizar schema | `true` (dev) | ❌ |
| `DB_LOGGING` | Log de queries | `true` (dev) | ❌ |
| `DB_SSL` | Usar SSL | `false` | ❌ |

### Configurações do Kafka

| Variável | Descrição | Padrão | Obrigatória |
|----------|-----------|--------|-------------|
| `KAFKA_CLIENT_ID` | ID do cliente Kafka | `meu-paozin-api` | ✅ |
| `KAFKA_BROKERS` | Lista de brokers | `localhost:9092` | ✅ |
| `KAFKA_GROUP_ID` | ID do grupo | `meu-paozin-group` | ✅ |
| `KAFKA_CONSUMER_GROUP_ID` | ID do grupo consumidor | `meu-paozin-consumer-group` | ✅ |
| `KAFKA_RETRY_INITIAL_RETRY_TIME` | Tempo inicial de retry | `100` | ❌ |
| `KAFKA_RETRY_RETRIES` | Número de tentativas | `8` | ❌ |

### Configurações do Zookeeper (para Kafka)

| Variável | Descrição | Padrão | Obrigatória |
|----------|-----------|--------|-------------|
| `ZOOKEEPER_CLIENT_PORT` | Porta do Zookeeper | `2181` | ❌ |
| `ZOOKEEPER_TICK_TIME` | Tick time do Zookeeper | `2000` | ❌ |

### Configurações do Swagger

| Variável | Descrição | Padrão | Obrigatória |
|----------|-----------|--------|-------------|
| `SWAGGER_TITLE` | Título da documentação | `MeuPaoZin API` | ❌ |
| `SWAGGER_DESCRIPTION` | Descrição da API | `API para gerenciamento de pedidos de pães` | ❌ |
| `SWAGGER_VERSION` | Versão da documentação | `2.0.0` | ❌ |
| `SWAGGER_PATH` | Caminho da documentação | `api/docs` | ❌ |

### Configurações de Segurança

| Variável | Descrição | Padrão | Obrigatória |
|----------|-----------|--------|-------------|
| `JWT_SECRET` | Chave secreta do JWT | - | ❌ |
| `JWT_EXPIRES_IN` | Expiração do JWT | `1d` | ❌ |
| `JWT_REFRESH_SECRET` | Chave de refresh | - | ❌ |
| `JWT_REFRESH_EXPIRES_IN` | Expiração do refresh | `7d` | ❌ |

### Configurações de Log

| Variável | Descrição | Padrão | Obrigatória |
|----------|-----------|--------|-------------|
| `LOG_LEVEL` | Nível de log | `debug` | ❌ |
| `LOG_FORMAT` | Formato do log | `combined` | ❌ |
| `LOG_COLORIZE` | Colorizar logs | `true` | ❌ |

### Configurações de CORS

| Variável | Descrição | Padrão | Obrigatória |
|----------|-----------|--------|-------------|
| `CORS_ORIGIN` | Origem permitida | `*` | ❌ |
| `CORS_METHODS` | Métodos permitidos | `GET,HEAD,PUT,PATCH,POST,DELETE` | ❌ |
| `CORS_CREDENTIALS` | Permitir credenciais | `true` | ❌ |

### Configurações do Context7 (Opcional)

| Variável | Descrição | Padrão | Obrigatória |
|----------|-----------|--------|-------------|
| `CONTEXT7_API_KEY` | Chave da API Context7 | - | ❌ |
| `CONTEXT7_BASE_URL` | URL base do Context7 | `https://api.context7.com` | ❌ |
| `CONTEXT7_TIMEOUT` | Timeout da API | `30000` | ❌ |

### Configurações de Validação

| Variável | Descrição | Padrão | Obrigatória |
|----------|-----------|--------|-------------|
| `VALIDATION_WHITELIST` | Whitelist de propriedades | `true` | ❌ |
| `VALIDATION_FORBID_NON_WHITELISTED` | Rejeitar propriedades não permitidas | `true` | ❌ |
| `VALIDATION_TRANSFORM` | Transformar tipos automaticamente | `true` | ❌ |

## 🚀 Configuração por Ambiente

### Desenvolvimento Local

```bash
# Copie o arquivo de exemplo
cp env-complete.txt .env

# Edite as variáveis conforme necessário
nano .env
```

### Produção

```bash
# Variáveis obrigatórias para produção
NODE_ENV=production
PORT=3000
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USERNAME=your-production-db-user
DB_PASSWORD=your-production-db-password
DB_NAME=pedidos_db
DB_SYNCHRONIZE=false
DB_LOGGING=false
DB_SSL=true
KAFKA_BROKERS=your-production-kafka-brokers
JWT_SECRET=your-production-jwt-secret
LOG_LEVEL=info
CORS_ORIGIN=https://your-frontend-domain.com
```

### Testes (CI/CD)

```bash
# Variáveis para testes automatizados
NODE_ENV=test
CI=true
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=pedidos_test_db
DB_SYNCHRONIZE=true
DB_LOGGING=false
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=meu-paozin-api-test
KAFKA_GROUP_ID=meu-paozin-group-test
KAFKA_CONSUMER_GROUP_ID=meu-paozin-consumer-group-test
```

## 🐳 Configuração com Docker

### Desenvolvimento

```bash
# Usar docker-compose.yml
docker-compose up -d
```

### Produção

```bash
# Usar docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d
```

## 🔐 Segurança

### Variáveis Sensíveis

As seguintes variáveis devem ser tratadas como sensíveis:

- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CONTEXT7_API_KEY`

### Recomendações de Segurança

1. **Nunca commite senhas no repositório**
2. **Use secrets no GitHub Actions**
3. **Use variáveis de ambiente em produção**
4. **Rotacione chaves regularmente**
5. **Use SSL em produção**

## 🔄 GitHub Actions

### Secrets Necessários

Configure os seguintes secrets no seu repositório:

- `DOCKER_USERNAME`: Usuário do Docker Hub
- `DOCKER_PASSWORD`: Senha do Docker Hub
- `SNYK_TOKEN`: Token do Snyk (opcional)

### Variáveis de Ambiente no CI/CD

O workflow do GitHub Actions configura automaticamente as variáveis necessárias para testes.

## 📊 Monitoramento

### Logs

Configure logs adequados para cada ambiente:

- **Desenvolvimento**: Logs detalhados
- **Produção**: Logs de erro e warning
- **Testes**: Logs mínimos

### Métricas

Considere adicionar:

- `METRICS_ENABLED=true`
- `METRICS_PORT=9090`
- `METRICS_PATH=/metrics`

## 🛠️ Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verifique `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`
   - Teste conexão: `psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME`

2. **Erro de conexão com Kafka**
   - Verifique `KAFKA_BROKERS`
   - Teste conexão: `kafka-console-consumer --bootstrap-server $KAFKA_BROKERS --topic test`

3. **Erro de CORS**
   - Configure `CORS_ORIGIN` adequadamente
   - Verifique se o frontend está na origem permitida

4. **Erro de validação**
   - Verifique `VALIDATION_WHITELIST`, `VALIDATION_FORBID_NON_WHITELISTED`
   - Confirme se os DTOs estão corretos

### Comandos Úteis

```bash
# Testar conexão com banco
npm run docker:db

# Ver logs dos containers
npm run docker:logs

# Reiniciar serviços
npm run docker:restart

# Verificar status
npm run docker:status
```

## 📝 Exemplo de .env Completo

Veja o arquivo `env-complete.txt` para um exemplo completo de todas as variáveis de ambiente.

## 🔗 Links Úteis

- [Documentação NestJS](https://docs.nestjs.com/)
- [Documentação TypeORM](https://typeorm.io/)
- [Documentação Kafka](https://kafka.apache.org/documentation/)
- [Documentação Docker](https://docs.docker.com/)
- [GitHub Actions](https://docs.github.com/en/actions) 