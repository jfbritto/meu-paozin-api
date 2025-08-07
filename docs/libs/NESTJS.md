# NestJS

## Visão Geral

NestJS é um framework progressivo para Node.js que utiliza TypeScript/JavaScript para construir aplicações eficientes, escaláveis e de nível empresarial. Ele combina elementos de OOP (Programação Orientada a Objetos), FP (Programação Funcional) e FRP (Programação Reativa Funcional).

## Características Principais

- **Arquitetura Modular**: Baseada em decorators e módulos
- **Injeção de Dependência**: Sistema robusto de DI nativo
- **TypeScript First**: Suporte completo a TypeScript
- **Microserviços**: Suporte nativo para arquiteturas distribuídas
- **Testabilidade**: Fácil de testar com ferramentas integradas
- **Documentação Automática**: Integração com Swagger/OpenAPI

## Instalação

```bash
npm install --save @nestjs/common @nestjs/core @nestjs/platform-express
```

## Estrutura Básica

### Módulo Principal (app.module.ts)

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### Controller Básico

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
```

### Service Básico

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}
```

## Decorators Principais

### Decorators de Classe

- `@Module()`: Define um módulo NestJS
- `@Controller()`: Define um controller
- `@Injectable()`: Define um service/provider
- `@Entity()`: Define uma entidade (com TypeORM)

### Decorators de Método

- `@Get()`: Define um endpoint GET
- `@Post()`: Define um endpoint POST
- `@Put()`: Define um endpoint PUT
- `@Delete()`: Define um endpoint DELETE
- `@Patch()`: Define um endpoint PATCH

### Decorators de Parâmetro

- `@Body()`: Extrai o corpo da requisição
- `@Param()`: Extrai parâmetros da URL
- `@Query()`: Extrai query parameters
- `@Headers()`: Extrai headers da requisição

## Validação

### Configuração Global

```typescript
import { ValidationPipe } from '@nestjs/common';

app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

### DTOs com Validação

```typescript
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Email do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Nome do usuário' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Senha do usuário' })
  @MinLength(6)
  password: string;
}
```

## Documentação com Swagger

### Configuração

```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('API Documentation')
  .setDescription('Descrição da API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

### Decorators do Swagger

```typescript
import { ApiProperty, ApiResponse } from '@nestjs/swagger';

export class User {
  @ApiProperty({ description: 'ID do usuário' })
  id: number;

  @ApiProperty({ description: 'Nome do usuário' })
  name: string;
}

@ApiResponse({ status: 200, description: 'Usuário encontrado' })
@ApiResponse({ status: 404, description: 'Usuário não encontrado' })
@Get(':id')
findOne(@Param('id') id: string) {
  return this.usersService.findOne(+id);
}
```

## Testes

### Teste Unitário

```typescript
import { Test } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let catsController: CatsController;
  let catsService: CatsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [CatsService],
    }).compile();

    catsService = moduleRef.get<CatsService>(CatsService);
    catsController = moduleRef.get<CatsController>(CatsController);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result = ['test'];
      jest.spyOn(catsService, 'findAll').mockImplementation(() => result);

      expect(await catsController.findAll()).toBe(result);
    });
  });
});
```

## Lifecycle Events

### Eventos de Ciclo de Vida

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  onModuleInit() {
    console.log('Módulo inicializado');
  }

  onModuleDestroy() {
    console.log('Módulo destruído');
  }
}
```

## Middleware

### Middleware Global

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use((req, res, next) => {
    console.log('Middleware global');
    next();
  });

  await app.listen(3000);
}
bootstrap();
```

## Interceptors

### Interceptor de Logging

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`Execução levou ${Date.now() - now}ms`)),
      );
  }
}
```

## Guards

### Guard de Autenticação

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  private validateRequest(request: any): boolean {
    // Lógica de validação
    return true;
  }
}
```

## Pipes

### Pipe de Transformação

```typescript
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Lógica de transformação
    return value;
  }
}
```

## Configuração de Ambiente

### ConfigModule

```typescript
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
})
export class AppModule {}
```

## Estrutura de Projeto Recomendada

```
src/
├── app.module.ts
├── main.ts
├── controllers/
│   └── app.controller.ts
├── services/
│   └── app.service.ts
├── dto/
│   └── create-user.dto.ts
├── entities/
│   └── user.entity.ts
├── modules/
│   └── users/
│       ├── users.module.ts
│       ├── users.controller.ts
│       ├── users.service.ts
│       └── dto/
└── config/
    └── database.config.ts
```

## Comandos CLI

### Instalação do CLI

```bash
npm install -g @nestjs/cli
```

### Comandos Úteis

```bash
# Gerar um novo projeto
nest new project-name

# Gerar um controller
nest g controller users

# Gerar um service
nest g service users

# Gerar um módulo
nest g module users

# Gerar um resource completo
nest g resource users
```

## Boas Práticas

1. **Separação de Responsabilidades**: Use controllers apenas para roteamento
2. **Injeção de Dependência**: Prefira DI sobre instanciação manual
3. **DTOs**: Use DTOs para validação de entrada
4. **Interceptors**: Use interceptors para cross-cutting concerns
5. **Guards**: Use guards para autenticação e autorização
6. **Pipes**: Use pipes para transformação e validação
7. **Testes**: Escreva testes para todos os componentes
8. **Documentação**: Mantenha a documentação atualizada com Swagger

## Recursos Adicionais

- [Documentação Oficial](https://docs.nestjs.com/)
- [GitHub Repository](https://github.com/nestjs/nest)
- [Discord Community](https://discord.gg/nestjs)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/nestjs) 