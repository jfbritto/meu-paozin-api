# class-transformer

## Visão Geral

class-transformer é uma biblioteca que permite transformar objetos simples (plain objects) em instâncias de classes e vice-versa. É especialmente útil quando trabalha com APIs REST, onde os dados vêm como objetos simples mas você quer trabalhar com instâncias de classes.

## Características Principais

- **Transformação Bidirecional**: Objetos simples ↔ Instâncias de classe
- **Decorators**: API baseada em decorators para configuração
- **TypeScript**: Suporte completo a TypeScript
- **Serialização**: Conversão de instâncias para objetos simples
- **Deserialização**: Conversão de objetos simples para instâncias
- **Validação**: Integração com class-validator

## Instalação

```bash
npm install class-transformer class-validator
```

## Uso Básico

### Transformação Simples

```typescript
import { plainToClass, classToPlain } from 'class-transformer';

class User {
  id: number;
  name: string;
  email: string;
  
  constructor(id: number, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
  
  getFullInfo() {
    return `${this.name} (${this.email})`;
  }
}

// Objeto simples
const userObject = {
  id: 1,
  name: 'João',
  email: 'joao@example.com'
};

// Transformar para instância
const user = plainToClass(User, userObject);
console.log(user.getFullInfo()); // "João (joao@example.com)"

// Transformar de volta para objeto
const plainUser = classToPlain(user);
console.log(plainUser); // { id: 1, name: 'João', email: 'joao@example.com' }
```

## Decorators de Transformação

### @Transform()

```typescript
import { Transform, Type } from 'class-transformer';

class User {
  id: number;
  name: string;
  
  @Transform(({ value }) => value.toLowerCase())
  email: string;
  
  @Transform(({ value }) => new Date(value))
  createdAt: Date;
  
  @Transform(({ value }) => value ? 'Ativo' : 'Inativo')
  isActive: boolean;
}
```

### @Type()

```typescript
import { Type } from 'class-transformer';

class Address {
  street: string;
  city: string;
  zipCode: string;
}

class User {
  id: number;
  name: string;
  
  @Type(() => Address)
  address: Address;
  
  @Type(() => Address)
  addresses: Address[];
}
```

### @Expose() e @Exclude()

```typescript
import { Expose, Exclude } from 'class-transformer';

class User {
  @Expose()
  id: number;
  
  @Expose()
  name: string;
  
  @Expose()
  email: string;
  
  @Exclude()
  password: string;
  
  @Expose({ name: 'fullName' })
  getFullName() {
    return `${this.name} ${this.lastName}`;
  }
}
```

### @Transform() com Função Customizada

```typescript
import { Transform } from 'class-transformer';

class Product {
  id: number;
  name: string;
  
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseFloat(value);
    }
    return value;
  })
  price: number;
  
  @Transform(({ value, obj }) => {
    return `${obj.name} - R$ ${value.toFixed(2)}`;
  })
  get displayName() {
    return this.name;
  }
}
```

## Serialização e Deserialização

### Serialização (Class → Object)

```typescript
import { classToPlain, serialize } from 'class-transformer';

class User {
  id: number;
  name: string;
  email: string;
  
  @Exclude()
  password: string;
  
  @Expose({ name: 'fullName' })
  getFullName() {
    return `${this.name} ${this.lastName}`;
  }
}

const user = new User();
user.id = 1;
user.name = 'João';
user.email = 'joao@example.com';
user.password = 'secret';

// Serializar
const plainUser = classToPlain(user);
console.log(plainUser);
// { id: 1, name: 'João', email: 'joao@example.com', fullName: 'João undefined' }

// Ou usar serialize
const serialized = serialize(user);
```

### Deserialização (Object → Class)

```typescript
import { plainToClass, deserialize } from 'class-transformer';

class User {
  id: number;
  name: string;
  email: string;
  
  greet() {
    return `Olá, ${this.name}!`;
  }
}

const userData = {
  id: 1,
  name: 'João',
  email: 'joao@example.com'
};

// Deserializar
const user = plainToClass(User, userData);
console.log(user.greet()); // "Olá, João!"

// Ou usar deserialize
const user2 = deserialize(User, userData);
```

## Transformação de Arrays

```typescript
import { Type } from 'class-transformer';

class Product {
  id: number;
  name: string;
  price: number;
}

class Order {
  id: number;
  
  @Type(() => Product)
  products: Product[];
  
  @Type(() => Date)
  createdAt: Date;
}

const orderData = {
  id: 1,
  products: [
    { id: 1, name: 'Pão', price: 5.50 },
    { id: 2, name: 'Leite', price: 3.20 }
  ],
  createdAt: '2024-01-15T10:30:00Z'
};

const order = plainToClass(Order, orderData);
console.log(order.products[0] instanceof Product); // true
console.log(order.createdAt instanceof Date); // true
```

## Configuração de Opções

### Opções Globais

```typescript
import { plainToClass } from 'class-transformer';

const user = plainToClass(User, userData, {
  excludeExtraneousValues: true,
  enableImplicitConversion: true,
  exposeDefaultValues: true
});
```

### Opções de Exposição

```typescript
import { Expose } from 'class-transformer';

class User {
  @Expose()
  id: number;
  
  @Expose({ groups: ['admin'] })
  email: string;
  
  @Expose({ groups: ['user', 'admin'] })
  name: string;
  
  @Expose({ groups: ['admin'] })
  password: string;
}

// Serializar com grupos específicos
const userPlain = classToPlain(user, { groups: ['user'] });
// Resultado: { id: 1, name: 'João' }
```

## Integração com NestJS

### Configuração Global

```typescript
// main.ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Habilita transformação automática
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  await app.listen(3000);
}
```

### Uso em Controllers

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    // createUserDto já é uma instância da classe CreateUserDto
    return this.usersService.create(createUserDto);
  }
}
```

## Transformação de Datas

```typescript
import { Transform } from 'class-transformer';

class Event {
  id: number;
  name: string;
  
  @Transform(({ value }) => new Date(value))
  startDate: Date;
  
  @Transform(({ value }) => new Date(value))
  endDate: Date;
  
  getDuration() {
    return this.endDate.getTime() - this.startDate.getTime();
  }
}

const eventData = {
  id: 1,
  name: 'Reunião',
  startDate: '2024-01-15T10:00:00Z',
  endDate: '2024-01-15T11:00:00Z'
};

const event = plainToClass(Event, eventData);
console.log(event.getDuration()); // 3600000 (1 hora em ms)
```

## Transformação de Enums

```typescript
import { Transform } from 'class-transformer';

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

class User {
  id: number;
  name: string;
  
  @Transform(({ value }) => UserRole[value] || UserRole.USER)
  role: UserRole;
}

const userData = {
  id: 1,
  name: 'João',
  role: 'ADMIN'
};

const user = plainToClass(User, userData);
console.log(user.role); // UserRole.ADMIN
```

## Transformação de Valores Aninhados

```typescript
import { Type, Transform } from 'class-transformer';

class Address {
  street: string;
  city: string;
  
  @Transform(({ value }) => value.toUpperCase())
  state: string;
}

class User {
  id: number;
  name: string;
  
  @Type(() => Address)
  address: Address;
  
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map(addr => plainToClass(Address, addr));
    }
    return plainToClass(Address, value);
  })
  addresses: Address[];
}
```

## Boas Práticas

1. **Use decorators consistentemente**: Mantenha um padrão de uso dos decorators
2. **Separe responsabilidades**: Use DTOs para entrada e entidades para saída
3. **Valide dados**: Combine com class-validator para validação
4. **Documente transformações**: Documente transformações complexas
5. **Teste transformações**: Escreva testes para suas transformações customizadas
6. **Use grupos**: Use grupos para controlar o que é exposto
7. **Performance**: Evite transformações desnecessárias em loops grandes

## Casos de Uso Comuns

### API REST

```typescript
// DTO para entrada
class CreateUserDto {
  @IsString()
  name: string;
  
  @IsEmail()
  email: string;
}

// Entidade para saída
class UserResponse {
  @Expose()
  id: number;
  
  @Expose()
  name: string;
  
  @Expose()
  email: string;
  
  @Exclude()
  password: string;
}
```

### Cache/Storage

```typescript
class Product {
  id: number;
  name: string;
  price: number;
  
  @Transform(({ value }) => JSON.stringify(value))
  metadata: object;
  
  @Transform(({ value }) => JSON.parse(value))
  getMetadata() {
    return this.metadata;
  }
}
``` 