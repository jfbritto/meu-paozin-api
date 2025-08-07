# Swagger/OpenAPI (NestJS)

## Visão Geral

Swagger/OpenAPI é uma especificação para documentação de APIs REST. O módulo `@nestjs/swagger` integra essa funcionalidade ao NestJS, permitindo gerar documentação automática da API com base nos decorators e metadados dos controllers.

## Características Principais

- **Documentação Automática**: Gera documentação baseada nos decorators
- **Interface Interativa**: Interface web para testar endpoints
- **Validação de Schema**: Validação automática de request/response
- **Integração NestJS**: Decorators específicos para NestJS
- **OpenAPI 3.0**: Suporte à especificação OpenAPI 3.0
- **Customização**: Altamente customizável

## Instalação

```bash
npm install @nestjs/swagger swagger-ui-express
npm install @types/swagger-ui-express --save-dev
```

## Configuração Básica

### Configuração no main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Meu Pãozin API')
    .setDescription('API para gerenciamento de pedidos de pães')
    .setVersion('1.0')
    .addTag('pedidos', 'Operações relacionadas a pedidos')
    .addTag('clientes', 'Operações relacionadas a clientes')
    .addTag('tipos-pao', 'Operações relacionadas a tipos de pão')
    .addTag('status-pedido', 'Operações relacionadas a status de pedidos')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
```

## Decorators Principais

### @ApiTags()

```typescript
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Pedidos')
@Controller('pedidos')
export class PedidosController {
  // ...
}
```

### @ApiOperation()

```typescript
import { ApiOperation } from '@nestjs/swagger';

@Post()
@ApiOperation({ 
  summary: 'Criar um novo pedido',
  description: 'Cria um novo pedido no sistema'
})
async create(@Body() createPedidoDto: CreatePedidoDto) {
  // ...
}
```

### @ApiResponse()

```typescript
import { ApiResponse } from '@nestjs/swagger';

@Post()
@ApiResponse({ 
  status: 201, 
  description: 'Pedido criado com sucesso',
  type: Pedido 
})
@ApiResponse({ 
  status: 400, 
  description: 'Dados inválidos' 
})
@ApiResponse({ 
  status: 404, 
  description: 'Cliente, tipo de pão ou status não encontrado' 
})
async create(@Body() createPedidoDto: CreatePedidoDto) {
  // ...
}
```

### @ApiParam()

```typescript
import { ApiParam } from '@nestjs/swagger';

@Get(':id')
@ApiParam({ 
  name: 'id', 
  description: 'ID do pedido',
  type: 'number',
  example: 1
})
async findOne(@Param('id') id: number) {
  // ...
}
```

### @ApiQuery()

```typescript
import { ApiQuery } from '@nestjs/swagger';

@Get('recentes')
@ApiQuery({ 
  name: 'limit', 
  description: 'Número máximo de pedidos',
  type: 'number',
  required: false,
  example: 10
})
async findRecent(@Query('limit') limit?: number) {
  // ...
}
```

### @ApiBody()

```typescript
import { ApiBody } from '@nestjs/swagger';

@Post()
@ApiBody({
  type: CreatePedidoDto,
  description: 'Dados do pedido a ser criado',
  examples: {
    example1: {
      summary: 'Pedido básico',
      value: {
        clienteId: 1,
        tipoPaoId: 2,
        quantidade: 5,
        observacoes: 'Bem assado'
      }
    }
  }
})
async create(@Body() createPedidoDto: CreatePedidoDto) {
  // ...
}
```

## Decorators para DTOs

### @ApiProperty()

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreatePedidoDto {
  @ApiProperty({
    description: 'ID do cliente',
    example: 1,
    minimum: 1
  })
  clienteId: number;

  @ApiProperty({
    description: 'ID do tipo de pão',
    example: 2,
    minimum: 1
  })
  tipoPaoId: number;

  @ApiProperty({
    description: 'Quantidade de pães',
    example: 5,
    minimum: 1,
    maximum: 100
  })
  quantidade: number;

  @ApiProperty({
    description: 'Observações do pedido',
    example: 'Bem assado, por favor',
    required: false
  })
  observacoes?: string;
}
```

### @ApiPropertyOptional()

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePedidoDto {
  @ApiPropertyOptional({
    description: 'Nova quantidade de pães',
    example: 10,
    minimum: 1
  })
  quantidade?: number;

  @ApiPropertyOptional({
    description: 'Novas observações',
    example: 'Bem assado e fresco'
  })
  observacoes?: string;
}
```

### @ApiProperty() com Enums

```typescript
import { ApiProperty } from '@nestjs/swagger';

enum StatusPedido {
  PENDENTE = 'pendente',
  EM_PREPARO = 'em_preparo',
  PRONTO = 'pronto',
  ENTREGUE = 'entregue'
}

export class CreatePedidoDto {
  @ApiProperty({
    description: 'Status do pedido',
    enum: StatusPedido,
    example: StatusPedido.PENDENTE
  })
  status: StatusPedido;
}
```

## Configuração Avançada

### Configuração com Opções

```typescript
const config = new DocumentBuilder()
  .setTitle('Meu Pãozin API')
  .setDescription('API para gerenciamento de pedidos de pães')
  .setVersion('1.0')
  .addServer('http://localhost:3000', 'Servidor Local')
  .addServer('https://api.meupaozin.com', 'Servidor de Produção')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .addApiKey(
    {
      type: 'apiKey',
      name: 'X-API-KEY',
      in: 'header',
      description: 'API Key para autenticação',
    },
    'api-key',
  )
  .build();
```

### Configuração de Segurança

```typescript
// main.ts
const document = SwaggerModule.createDocument(app, config, {
  extraModels: [Pedido, Cliente, TipoPao],
  deepScanRoutes: true,
});

SwaggerModule.setup('api', app, document, {
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
  },
  customSiteTitle: 'Meu Pãozin API - Documentação',
  customCss: '.swagger-ui .topbar { display: none }',
});
```

## Exemplos de Controllers Completos

### Controller com Todas as Operações

```typescript
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBody 
} from '@nestjs/swagger';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { Pedido } from './entities/pedido.entity';

@ApiTags('Pedidos')
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar um novo pedido',
    description: 'Cria um novo pedido no sistema com os dados fornecidos'
  })
  @ApiBody({
    type: CreatePedidoDto,
    description: 'Dados do pedido a ser criado'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Pedido criado com sucesso',
    type: Pedido 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Cliente, tipo de pão ou status não encontrado' 
  })
  async create(@Body() createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    return await this.pedidosService.create(createPedidoDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todos os pedidos',
    description: 'Retorna uma lista de todos os pedidos cadastrados'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de pedidos retornada com sucesso',
    type: [Pedido] 
  })
  async findAll(): Promise<Pedido[]> {
    return await this.pedidosService.findAll();
  }

  @Get('recentes')
  @ApiOperation({ 
    summary: 'Listar pedidos recentes',
    description: 'Retorna os pedidos mais recentes com limite opcional'
  })
  @ApiQuery({ 
    name: 'limit', 
    description: 'Número máximo de pedidos',
    type: 'number',
    required: false,
    example: 10
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de pedidos recentes retornada com sucesso',
    type: [Pedido] 
  })
  async findRecent(@Query('limit') limit?: number): Promise<Pedido[]> {
    return await this.pedidosService.getPedidosRecentes(limit);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar pedido por ID',
    description: 'Retorna um pedido específico pelo seu ID'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do pedido',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Pedido encontrado com sucesso',
    type: Pedido 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Pedido não encontrado' 
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Pedido> {
    return await this.pedidosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Atualizar pedido',
    description: 'Atualiza um pedido existente com os novos dados'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do pedido',
    type: 'number',
    example: 1
  })
  @ApiBody({
    type: UpdatePedidoDto,
    description: 'Dados do pedido a ser atualizado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Pedido atualizado com sucesso',
    type: Pedido 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Pedido não encontrado' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos' 
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePedidoDto: UpdatePedidoDto
  ): Promise<Pedido> {
    return await this.pedidosService.update(id, updatePedidoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Excluir pedido',
    description: 'Remove um pedido do sistema'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do pedido',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Pedido excluído com sucesso' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Pedido não encontrado' 
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.pedidosService.remove(id);
  }
}
```

## Entidades com Swagger

### Entity com @ApiProperty()

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { TipoPao } from '../../tipos-pao/entities/tipo-pao.entity';
import { StatusPedido } from '../../status-pedido/entities/status-pedido.entity';

@Entity('pedidos')
export class Pedido {
  @ApiProperty({
    description: 'ID único do pedido',
    example: 1
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'ID do cliente',
    example: 1
  })
  @Column({ name: 'cliente_id' })
  clienteId: number;

  @ApiProperty({
    description: 'ID do tipo de pão',
    example: 2
  })
  @Column({ name: 'tipo_pao_id' })
  tipoPaoId: number;

  @ApiProperty({
    description: 'Quantidade de pães',
    example: 5
  })
  @Column()
  quantidade: number;

  @ApiProperty({
    description: 'Observações do pedido',
    example: 'Bem assado, por favor',
    required: false
  })
  @Column({ nullable: true })
  observacoes?: string;

  @ApiProperty({
    description: 'Data de criação do pedido',
    example: '2024-01-15T10:30:00Z'
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-15T11:00:00Z'
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Cliente do pedido',
    type: () => Cliente
  })
  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @ApiProperty({
    description: 'Tipo de pão do pedido',
    type: () => TipoPao
  })
  @ManyToOne(() => TipoPao)
  @JoinColumn({ name: 'tipo_pao_id' })
  tipoPao: TipoPao;

  @ApiProperty({
    description: 'Status atual do pedido',
    type: () => StatusPedido
  })
  @ManyToOne(() => StatusPedido)
  @JoinColumn({ name: 'status_id' })
  status: StatusPedido;
}
```

## Configuração de Autenticação

### Bearer Token

```typescript
// main.ts
const config = new DocumentBuilder()
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .build();

// Controller
@Post()
@ApiBearerAuth('JWT-auth')
async create(@Body() createPedidoDto: CreatePedidoDto) {
  // ...
}
```

### API Key

```typescript
// main.ts
const config = new DocumentBuilder()
  .addApiKey(
    {
      type: 'apiKey',
      name: 'X-API-KEY',
      in: 'header',
      description: 'API Key para autenticação',
    },
    'api-key',
  )
  .build();

// Controller
@Get()
@ApiHeader({
  name: 'X-API-KEY',
  description: 'API Key para autenticação',
  required: true,
})
async findAll() {
  // ...
}
```

## Personalização da Interface

### CSS Customizado

```typescript
SwaggerModule.setup('api', app, document, {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .scheme-container { background: #f7f7f7 }
  `,
  customSiteTitle: 'Meu Pãozin API - Documentação',
  customfavIcon: '/favicon.ico',
});
```

### Opções do Swagger UI

```typescript
SwaggerModule.setup('api', app, document, {
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    tryItOutEnabled: true,
    requestInterceptor: (req) => {
      req.headers['X-Custom-Header'] = 'custom-value';
      return req;
    },
    responseInterceptor: (res) => {
      return res;
    },
  },
});
```

## Boas Práticas

1. **Use @ApiTags()**: Organize endpoints por tags
2. **Descreva operações**: Use descrições claras e concisas
3. **Documente respostas**: Inclua todos os códigos de status possíveis
4. **Use exemplos**: Forneça exemplos realistas
5. **Valide schemas**: Use decorators de validação
6. **Mantenha atualizado**: Atualize a documentação quando mudar a API
7. **Teste a documentação**: Use a interface para testar endpoints
8. **Use tipos corretos**: Defina tipos apropriados para propriedades
9. **Documente erros**: Inclua informações sobre erros comuns
10. **Versionamento**: Mantenha controle de versões da API

## Troubleshooting

### Problemas Comuns

1. **Decorators não aparecem**: Verifique se o módulo está importado
2. **Tipos não reconhecidos**: Use @ApiProperty() em entidades
3. **Autenticação não funciona**: Configure corretamente os decorators de auth
4. **Interface não carrega**: Verifique se o SwaggerModule.setup() está correto

### Debug

```typescript
// Habilitar logs detalhados
const document = SwaggerModule.createDocument(app, config, {
  extraModels: [Pedido, Cliente, TipoPao],
  deepScanRoutes: true,
});

console.log('Swagger document:', JSON.stringify(document, null, 2));
``` 