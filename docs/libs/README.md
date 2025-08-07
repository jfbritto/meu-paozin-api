# Documentação das Bibliotecas

Este diretório contém a documentação completa das bibliotecas de terceiros utilizadas no projeto **Meu Pãozin API**.

## Bibliotecas Documentadas

### Frameworks e Core
- **[NESTJS.md](./NESTJS.md)** - Framework principal para construção da API
- **[TYPEORM.md](./TYPEORM.md)** - ORM para gerenciamento do banco de dados

### Validação e Transformação
- **[CLASS-VALIDATOR.md](./CLASS-VALIDATOR.md)** - Biblioteca de validação baseada em decorators
- **[CLASS-TRANSFORMER.md](./CLASS-TRANSFORMER.md)** - Biblioteca para transformação de objetos

### Documentação da API
- **[SWAGGER.md](./SWAGGER.md)** - Documentação automática da API com Swagger/OpenAPI

### Banco de Dados
- **[POSTGRESQL.md](./POSTGRESQL.md)** - Driver e configuração do PostgreSQL

## Como Usar Esta Documentação

### Para Desenvolvedores
1. **Nova funcionalidade**: Consulte a documentação da biblioteca relevante
2. **Debugging**: Use os exemplos de código para identificar problemas
3. **Boas práticas**: Siga as recomendações de cada biblioteca
4. **Configuração**: Use os exemplos de configuração como referência

### Para Manutenção
1. **Atualizações**: Verifique se as práticas documentadas ainda são válidas
2. **Novas versões**: Atualize a documentação quando necessário
3. **Problemas conhecidos**: Documente workarounds e soluções

## Estrutura da Documentação

Cada arquivo de documentação segue uma estrutura padrão:

1. **Visão Geral** - Descrição da biblioteca e seus objetivos
2. **Características Principais** - Lista das funcionalidades principais
3. **Instalação** - Como instalar e configurar
4. **Uso Básico** - Exemplos fundamentais
5. **Recursos Avançados** - Funcionalidades mais complexas
6. **Integração** - Como usar com outras bibliotecas do projeto
7. **Boas Práticas** - Recomendações de uso
8. **Casos de Uso** - Exemplos práticos do projeto

## Bibliotecas Utilizadas no Projeto

### Dependências Principais
```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/platform-express": "^10.0.0",
  "@nestjs/typeorm": "^10.0.0",
  "@nestjs/swagger": "^7.0.0",
  "typeorm": "^0.3.0",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1",
  "pg": "^8.11.0",
  "swagger-ui-express": "^5.0.0"
}
```

### Dependências de Desenvolvimento
```json
{
  "@types/pg": "^8.10.0",
  "@types/swagger-ui-express": "^4.1.0",
  "@nestjs/testing": "^10.0.0",
  "@nestjs/cli": "^10.0.0"
}
```

## Integração entre Bibliotecas

### NestJS + TypeORM
- TypeORM é integrado ao NestJS através do `@nestjs/typeorm`
- Entidades são definidas com decorators do TypeORM
- Repositories são injetados nos services

### NestJS + class-validator
- Validação automática através do `ValidationPipe`
- DTOs são validados automaticamente
- Mensagens de erro customizadas

### TypeORM + PostgreSQL
- PostgreSQL como banco de dados principal
- Configuração de conexão via TypeORM
- Migrations para controle de schema

### NestJS + Swagger
- Documentação automática da API
- Interface interativa para testes
- Validação de schemas de request/response

## Configuração do Ambiente

### Variáveis de Ambiente
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=meu_paozin

# Application
PORT=3000
NODE_ENV=development
```

### Scripts de Desenvolvimento
```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run start:dev

# Executar testes
npm run test

# Executar migrations
npm run typeorm migration:run
```

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verificar se o PostgreSQL está rodando
   - Confirmar credenciais no arquivo .env
   - Verificar se o banco existe

2. **Erro de validação**
   - Verificar se os DTOs estão corretamente definidos
   - Confirmar se o ValidationPipe está configurado
   - Verificar decorators do class-validator

3. **Erro de transformação**
   - Verificar se class-transformer está configurado
   - Confirmar se os decorators estão corretos
   - Verificar tipos de dados

### Logs Úteis
```typescript
// Habilitar logs do TypeORM
logging: true

// Habilitar logs do NestJS
app.useLogger(new Logger());
```

## Contribuição

Para atualizar esta documentação:

1. **Adicionar nova biblioteca**: Crie um novo arquivo .md
2. **Atualizar existente**: Modifique o arquivo correspondente
3. **Exemplos**: Inclua exemplos práticos do projeto
4. **Boas práticas**: Documente padrões estabelecidos

### Template para Nova Documentação
```markdown
# Nome da Biblioteca

## Visão Geral
[Descrição da biblioteca]

## Características Principais
- [Lista de características]

## Instalação
```bash
npm install [package-name]
```

## Uso Básico
[Exemplos básicos]

## Recursos Avançados
[Funcionalidades avançadas]

## Integração com NestJS
[Como usar com o projeto]

## Boas Práticas
[Lista de recomendações]
```

## Recursos Adicionais

### Links Úteis
- [Documentação oficial do NestJS](https://docs.nestjs.com/)
- [Documentação oficial do TypeORM](https://typeorm.io/)
- [Documentação oficial do PostgreSQL](https://www.postgresql.org/docs/)
- [Documentação do class-validator](https://github.com/typestack/class-validator)
- [Documentação do class-transformer](https://github.com/typestack/class-transformer)
- [Documentação do Swagger/OpenAPI](https://swagger.io/docs/)
- [Documentação do NestJS Swagger](https://docs.nestjs.com/openapi/introduction)

### Comunidades
- [NestJS Discord](https://discord.gg/nestjs)
- [TypeORM GitHub](https://github.com/typeorm/typeorm)
- [PostgreSQL Community](https://www.postgresql.org/community/)

---

**Última atualização**: Janeiro 2024
**Versão do projeto**: 1.0.0 