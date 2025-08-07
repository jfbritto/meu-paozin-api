# Documentação das Rotas da API - Meu Pãozin

## Visão Geral

Esta documentação descreve todas as rotas disponíveis na API do sistema "Meu Pãozin", um sistema de gestão de pedidos para padarias. A API é construída com NestJS e utiliza PostgreSQL como banco de dados.

**Base URL:** `http://localhost:3000` (desenvolvimento)

## Estrutura da API

### 1. Rota Principal

#### `GET /`
- **Descrição:** Endpoint de saúde da aplicação
- **Método:** GET
- **Resposta:** String simples indicando que a API está funcionando
- **Status Codes:**
  - `200`: API funcionando normalmente

---

## Módulo de Clientes (`/clientes`)

### 1. Criar Cliente
- **Rota:** `POST /clientes`
- **Descrição:** Cria um novo cliente no sistema
- **Body:**
  ```json
  {
    "nome": "João Silva",
    "email": "joao.silva@email.com",
    "telefone": "(11) 99999-9999",
    "endereco": "Rua das Flores, 123 - Centro"
  }
  ```
- **Campos Obrigatórios:** `nome`, `email`
- **Campos Opcionais:** `telefone`, `endereco`
- **Validações:**
  - Nome: 2-100 caracteres
  - Email: formato válido
  - Telefone: 10-20 caracteres (opcional)
- **Status Codes:**
  - `201`: Cliente criado com sucesso
  - `400`: Dados inválidos
  - `409`: Email já existe

### 2. Listar Todos os Clientes
- **Rota:** `GET /clientes`
- **Descrição:** Retorna todos os clientes cadastrados
- **Status Codes:**
  - `200`: Lista de clientes retornada

### 3. Listar Clientes Ativos
- **Rota:** `GET /clientes/ativos`
- **Descrição:** Retorna apenas clientes com status ativo
- **Status Codes:**
  - `200`: Lista de clientes ativos retornada

### 4. Buscar Cliente por ID
- **Rota:** `GET /clientes/:id`
- **Descrição:** Busca um cliente específico pelo ID
- **Parâmetros:** `id` (number)
- **Status Codes:**
  - `200`: Cliente encontrado
  - `404`: Cliente não encontrado

### 5. Buscar Cliente por Email
- **Rota:** `GET /clientes/email/:email`
- **Descrição:** Busca um cliente pelo email
- **Parâmetros:** `email` (string)
- **Status Codes:**
  - `200`: Cliente encontrado
  - `404`: Cliente não encontrado

### 6. Atualizar Cliente
- **Rota:** `PATCH /clientes/:id`
- **Descrição:** Atualiza dados de um cliente existente
- **Parâmetros:** `id` (number)
- **Body:** Mesmo formato do create, todos os campos opcionais
- **Status Codes:**
  - `200`: Cliente atualizado
  - `404`: Cliente não encontrado
  - `409`: Email já existe

### 7. Excluir Cliente
- **Rota:** `DELETE /clientes/:id`
- **Descrição:** Remove um cliente do sistema
- **Parâmetros:** `id` (number)
- **Status Codes:**
  - `204`: Cliente excluído
  - `404`: Cliente não encontrado

---

## Módulo de Pedidos (`/pedidos`)

### Status dos Pedidos
Os pedidos utilizam um enum com os seguintes valores:
- `REALIZADO` - Pedido realizado pelo cliente
- `ACEITO` - Pedido aceito pela padaria
- `EM_PREPARO` - Pedido em preparação
- `SAIU_PARA_ENTREGA` - Pedido saiu para entrega
- `FINALIZADO` - Pedido finalizado/entregue
- `CANCELADO` - Pedido cancelado

### 1. Criar Pedido
- **Rota:** `POST /pedidos`
- **Descrição:** Cria um novo pedido no sistema
- **Body:**
  ```json
  {
    "clienteId": 1,
    "tipoPaoId": 1,
    "quantidade": 5,
    "status": "REALIZADO",
    "observacoes": "Sem sal"
  }
  ```
- **Campos Obrigatórios:** `clienteId`, `tipoPaoId`, `quantidade`
- **Campos Opcionais:** `status`, `observacoes`
- **Status Padrão:** `REALIZADO` (aplicado automaticamente se não especificado)
- **Validações:**
  - Quantidade: mínimo 1
  - Status: deve ser um dos valores do enum
  - Observações: máximo 500 caracteres
- **Status Codes:**
  - `201`: Pedido criado com sucesso
  - `400`: Dados inválidos
  - `404`: Cliente ou tipo de pão não encontrado

### 2. Listar Todos os Pedidos
- **Rota:** `GET /pedidos`
- **Descrição:** Retorna todos os pedidos do sistema
- **Status Codes:**
  - `200`: Lista de pedidos retornada

### 3. Listar Status Disponíveis
- **Rota:** `GET /pedidos/status`
- **Descrição:** Retorna todos os status disponíveis para pedidos
- **Status Codes:**
  - `200`: Lista de status retornada
- **Resposta:**
  ```json
  [
    "CANCELADO",
    "REALIZADO",
    "ACEITO",
    "EM_PREPARO",
    "SAIU_PARA_ENTREGA",
    "FINALIZADO"
  ]
  ```

### 4. Listar Pedidos Recentes
- **Rota:** `GET /pedidos/recentes`
- **Descrição:** Retorna os pedidos mais recentes
- **Query Parameters:** `limit` (opcional, number)
- **Status Codes:**
  - `200`: Lista de pedidos recentes retornada

### 5. Buscar Pedido por ID
- **Rota:** `GET /pedidos/:id`
- **Descrição:** Busca um pedido específico pelo ID
- **Parâmetros:** `id` (number)
- **Status Codes:**
  - `200`: Pedido encontrado
  - `404`: Pedido não encontrado

### 6. Buscar Pedidos por Status
- **Rota:** `GET /pedidos/status/:status`
- **Descrição:** Busca todos os pedidos de um status específico
- **Parâmetros:** `status` (string - um dos valores do enum)
- **Status Codes:**
  - `200`: Lista de pedidos por status retornada

### 7. Buscar Pedidos por Cliente
- **Rota:** `GET /pedidos/cliente/:clienteId`
- **Descrição:** Busca todos os pedidos de um cliente específico
- **Parâmetros:** `clienteId` (number)
- **Status Codes:**
  - `200`: Lista de pedidos por cliente retornada

### 8. Buscar Pedidos por Tipo de Pão
- **Rota:** `GET /pedidos/tipo-pao/:tipoPaoId`
- **Descrição:** Busca todos os pedidos de um tipo de pão específico
- **Parâmetros:** `tipoPaoId` (number)
- **Status Codes:**
  - `200`: Lista de pedidos por tipo de pão retornada

### 9. Atualizar Pedido
- **Rota:** `PATCH /pedidos/:id`
- **Descrição:** Atualiza dados de um pedido existente
- **Parâmetros:** `id` (number)
- **Body:** Mesmo formato do create, todos os campos opcionais
- **Status Codes:**
  - `200`: Pedido atualizado
  - `400`: Dados inválidos
  - `404`: Pedido, cliente ou tipo de pão não encontrado

### 10. Excluir Pedido
- **Rota:** `DELETE /pedidos/:id`
- **Descrição:** Remove um pedido do sistema
- **Parâmetros:** `id` (number)
- **Status Codes:**
  - `204`: Pedido excluído
  - `404`: Pedido não encontrado

---

## Módulo de Tipos de Pão (`/tipos-pao`)

### 1. Criar Tipo de Pão
- **Rota:** `POST /tipos-pao`
- **Descrição:** Cria um novo tipo de pão
- **Body:**
  ```json
  {
    "nome": "Pão de Queijo",
    "descricao": "Pão de queijo tradicional",
    "preco": 2.50
  }
  ```
- **Campos Obrigatórios:** `nome`
- **Campos Opcionais:** `descricao`, `preco`
- **Status Codes:**
  - `201`: Tipo de pão criado com sucesso
  - `400`: Dados inválidos
  - `409`: Nome já existe

### 2. Listar Todos os Tipos de Pão
- **Rota:** `GET /tipos-pao`
- **Descrição:** Retorna todos os tipos de pão
- **Status Codes:**
  - `200`: Lista de tipos de pão retornada

### 3. Listar Tipos de Pão Ativos
- **Rota:** `GET /tipos-pao/ativos`
- **Descrição:** Retorna apenas tipos de pão ativos
- **Status Codes:**
  - `200`: Lista de tipos de pão ativos retornada

### 4. Buscar Tipo de Pão por ID
- **Rota:** `GET /tipos-pao/:id`
- **Descrição:** Busca um tipo de pão específico pelo ID
- **Parâmetros:** `id` (number)
- **Status Codes:**
  - `200`: Tipo de pão encontrado
  - `404`: Tipo de pão não encontrado

### 5. Buscar Tipo de Pão por Nome
- **Rota:** `GET /tipos-pao/nome/:nome`
- **Descrição:** Busca um tipo de pão pelo nome
- **Parâmetros:** `nome` (string)
- **Status Codes:**
  - `200`: Tipo de pão encontrado
  - `404`: Tipo de pão não encontrado

### 6. Atualizar Tipo de Pão
- **Rota:** `PATCH /tipos-pao/:id`
- **Descrição:** Atualiza dados de um tipo de pão existente
- **Parâmetros:** `id` (number)
- **Body:** Mesmo formato do create, todos os campos opcionais
- **Status Codes:**
  - `200`: Tipo de pão atualizado
  - `404`: Tipo de pão não encontrado
  - `409`: Nome já existe

### 7. Alternar Status Ativo/Inativo
- **Rota:** `PATCH /tipos-pao/:id/toggle`
- **Descrição:** Alterna o status ativo/inativo do tipo de pão
- **Parâmetros:** `id` (number)
- **Status Codes:**
  - `200`: Status alternado
  - `404`: Tipo de pão não encontrado

### 8. Excluir Tipo de Pão
- **Rota:** `DELETE /tipos-pao/:id`
- **Descrição:** Remove um tipo de pão do sistema
- **Parâmetros:** `id` (number)
- **Status Codes:**
  - `204`: Tipo de pão excluído
  - `404`: Tipo de pão não encontrado
  - `409`: Tipo de pão possui pedidos associados

---

## Especificações Técnicas

### Tecnologias Utilizadas
- **Framework:** NestJS
- **Banco de Dados:** PostgreSQL
- **ORM:** TypeORM
- **Validação:** class-validator
- **Documentação:** Swagger/OpenAPI
- **Testes:** Jest

### Padrões de Resposta

#### Sucesso (200/201)
```json
{
  "id": 1,
  "nome": "Exemplo",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Erro (400/404/409)
```json
{
  "statusCode": 400,
  "message": "Mensagem de erro",
  "error": "Bad Request"
}
```

### Autenticação e Autorização
- Atualmente não implementado
- Recomendado implementar JWT para produção

### Rate Limiting
- Não implementado
- Recomendado para produção

### Logs
- Logs estruturados com Winston
- Níveis: error, warn, info, debug

### Monitoramento
- Health check disponível em `/`
- Métricas básicas implementadas

### Versionamento
- API v1 (sem prefixo de versão)
- Compatibilidade retroativa mantida

---

## Exemplos de Uso

### Criar um Cliente
```bash
curl -X POST http://localhost:3000/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "(11) 99999-9999"
  }'
```

### Criar um Pedido
```bash
curl -X POST http://localhost:3000/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": 1,
    "tipoPaoId": 1,
    "quantidade": 5,
    "observacoes": "Sem sal"
  }'
```

### Buscar Pedidos de um Cliente
```bash
curl -X GET http://localhost:3000/pedidos/cliente/1
```

### Buscar Pedidos por Status
```bash
curl -X GET http://localhost:3000/pedidos/status/REALIZADO
```

### Listar Status Disponíveis
```bash
curl -X GET http://localhost:3000/pedidos/status
```

---

## Notas Importantes

1. **Validação:** Todos os endpoints validam dados de entrada usando class-validator
2. **Relacionamentos:** Pedidos dependem de Clientes e Tipos de Pão existentes
3. **Status Enum:** Os status dos pedidos são fixos e definidos como enum
4. **Soft Delete:** Implementado para manter integridade referencial
5. **Transações:** Operações críticas são executadas em transações
6. **Indexação:** Índices criados para campos frequentemente consultados
7. **Cache:** Não implementado, recomendado para produção

---

*Documentação atualizada em: Janeiro 2024*
*Versão da API: 2.0*
*Mudanças: Removida tabela de status, implementado enum StatusPedido* 