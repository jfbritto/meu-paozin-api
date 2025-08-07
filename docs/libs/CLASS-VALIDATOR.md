# class-validator

## Visão Geral

class-validator é uma biblioteca de validação baseada em decorators para TypeScript e JavaScript. Ela permite validar objetos usando decorators e pode ser facilmente integrada com frameworks como NestJS.

## Características Principais

- **Decorators**: API baseada em decorators para validação
- **TypeScript**: Suporte completo a TypeScript
- **Validações Customizadas**: Possibilidade de criar validadores personalizados
- **Mensagens de Erro**: Customização de mensagens de erro
- **Validação Condicional**: Validação baseada em condições
- **Integração**: Fácil integração com frameworks

## Instalação

```bash
npm install class-validator class-transformer
```

## Decorators de Validação

### Validações Básicas

```typescript
import { IsString, IsNumber, IsOptional, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNumber()
  age: number;

  @IsOptional()
  @IsString()
  bio?: string;
}
```

### Validações de String

```typescript
import { 
  IsString, 
  MinLength, 
  MaxLength, 
  Matches,
  IsNotEmpty 
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  password: string;
}
```

### Validações de Número

```typescript
import { IsNumber, Min, Max, IsPositive } from 'class-validator';

export class CreateProductDto {
  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @IsPositive()
  @Max(100)
  discount: number;
}
```

### Validações de Array

```typescript
import { IsArray, ArrayMinSize, ArrayMaxSize, IsString } from 'class-validator';

export class CreatePostDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags: string[];
}
```

### Validações de Data

```typescript
import { IsDate, IsDateString, IsOptional } from 'class-validator';

export class CreateEventDto {
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDate()
  endDate?: Date;
}
```

## Validações Customizadas

### Criando Validador Customizado

```typescript
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const hasUpperCase = /[A-Z]/.test(value);
          const hasLowerCase = /[a-z]/.test(value);
          const hasNumbers = /\d/.test(value);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
          
          return value.length >= 8 && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character';
        }
      }
    });
  };
}
```

### Usando Validador Customizado

```typescript
import { IsString } from 'class-validator';
import { IsStrongPassword } from './custom-validators';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsStrongPassword()
  password: string;
}
```

## Validação Condicional

```typescript
import { ValidateIf, IsString, IsNumber } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  name: string;

  @ValidateIf((o) => o.age !== undefined)
  @IsNumber()
  age?: number;
}
```

## Validação de Objetos Aninhados

```typescript
import { ValidateNested, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsNumber()
  zipCode: number;
}

export class CreateUserDto {
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
```

## Integração com NestJS

### Configuração Global

```typescript
// main.ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  await app.listen(3000);
}
```

### Validação em Controllers

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

## Tratamento de Erros

```typescript
import { ValidationPipe, BadRequestException } from '@nestjs/common';

app.useGlobalPipes(new ValidationPipe({
  exceptionFactory: (errors) => {
    const messages = errors.map(error => 
      Object.values(error.constraints).join(', ')
    );
    return new BadRequestException(messages);
  }
}));
```

## Decorators Mais Comuns

- `@IsString()` - Valida se é string
- `@IsNumber()` - Valida se é número
- `@IsBoolean()` - Valida se é boolean
- `@IsDate()` - Valida se é data
- `@IsEmail()` - Valida formato de email
- `@IsUrl()` - Valida formato de URL
- `@IsOptional()` - Campo opcional
- `@IsNotEmpty()` - Campo não pode estar vazio
- `@Min()` - Valor mínimo
- `@Max()` - Valor máximo
- `@MinLength()` - Comprimento mínimo
- `@MaxLength()` - Comprimento máximo
- `@Matches()` - Validação com regex
- `@IsArray()` - Valida se é array
- `@ValidateNested()` - Valida objeto aninhado

## Recursos Avançados

### Validação de Enum

```typescript
import { IsEnum } from 'class-validator';

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

export class CreateUserDto {
  @IsEnum(UserRole)
  role: UserRole;
}
```

### Validação de UUID

```typescript
import { IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  userId: string;
}
```

### Validação de JSON

```typescript
import { IsJSON } from 'class-validator';

export class CreateConfigDto {
  @IsJSON()
  settings: string; // JSON string
}
```

## Boas Práticas

1. **Use DTOs específicos**: Crie DTOs separados para criação e atualização
2. **Validação rigorosa**: Use `whitelist: true` para rejeitar propriedades não esperadas
3. **Mensagens claras**: Customize mensagens de erro para melhor UX
4. **Validação em camadas**: Valide tanto no frontend quanto no backend
5. **Testes**: Escreva testes para suas validações customizadas 