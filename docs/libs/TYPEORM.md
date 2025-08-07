# TypeORM

## Visão Geral

TypeORM é um ORM (Object-Relational Mapping) para TypeScript e JavaScript que suporta MySQL, PostgreSQL, MariaDB, SQLite, MS SQL Server, Oracle, SAP Hana e WebSQL. Funciona em NodeJS, Browser, Ionic, Cordova e Electron.

## Características Principais

- **Suporte a Múltiplos Bancos**: MySQL, PostgreSQL, MariaDB, SQLite, etc.
- **TypeScript First**: Desenvolvido nativamente para TypeScript
- **Decorators**: API baseada em decorators
- **Relacionamentos**: Suporte completo a relacionamentos
- **Migrations**: Sistema de migrações automático
- **Query Builder**: Query builder poderoso
- **Connection Pooling**: Pool de conexões integrado

## Instalação

```bash
npm install typeorm reflect-metadata
npm install @types/node --save-dev
```

## Configuração do TypeScript

```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```

## Configuração Básica

### DataSource (Nova API)

```typescript
import { DataSource } from "typeorm"

const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "test",
  password: "test",
  database: "test",
  synchronize: true,
  logging: false,
  entities: [],
  migrations: [],
  subscribers: [],
})

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!")
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err)
  })
```

### Connection (API Legada)

```typescript
import { createConnection } from "typeorm"

const connection = await createConnection({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "test",
  password: "test",
  database: "test",
  entities: [],
  synchronize: true,
})
```

## Entidades

### Entidade Básica

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  isActive: boolean
}
```

### Decorators de Coluna

```typescript
@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "varchar", length: 200, unique: true })
  firstName: string

  @Column({ nullable: true })
  lastName: string

  @Column({ default: false })
  isActive: boolean

  @Column({ type: "decimal", precision: 10, scale: 2 })
  salary: number

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date
}
```

### Tipos de Coluna

```typescript
@Column("int")           // integer
@Column("varchar")       // varchar
@Column("text")          // text
@Column("boolean")       // boolean
@Column("decimal")       // decimal
@Column("float")         // float
@Column("double")        // double
@Column("date")          // date
@Column("datetime")      // datetime
@Column("timestamp")     // timestamp
@Column("json")          // json
@Column("simple-array")  // simple array
@Column("simple-json")   // simple json
```

## Relacionamentos

### One-to-One

```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm"

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  gender: string

  @Column()
  photo: string
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile
}
```

### One-to-Many / Many-to-One

```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm"

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @OneToMany(() => Photo, photo => photo.user)
  photos: Photo[]
}

@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  url: string

  @ManyToOne(() => User, user => user.photos)
  user: User
}
```

### Many-to-Many

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm"

@Entity()
export class Album {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @ManyToMany(() => Photo)
  @JoinTable()
  photos: Photo[]
}

@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  url: string

  @ManyToMany(() => Album, album => album.photos)
  albums: Album[]
}
```

## Repositories

### Repository Pattern

```typescript
import { Repository } from "typeorm"
import { User } from "./entity/User"

const userRepository = AppDataSource.getRepository(User)

// Encontrar todos os usuários
const users = await userRepository.find()

// Encontrar por ID
const user = await userRepository.findOneBy({ id: 1 })

// Criar novo usuário
const newUser = userRepository.create({
  firstName: "John",
  lastName: "Doe",
  isActive: true
})
await userRepository.save(newUser)

// Atualizar usuário
await userRepository.update(1, { firstName: "Jane" })

// Deletar usuário
await userRepository.delete(1)
```

### Query Builder

```typescript
const users = await userRepository
  .createQueryBuilder("user")
  .where("user.isActive = :isActive", { isActive: true })
  .andWhere("user.firstName = :firstName", { firstName: "John" })
  .orderBy("user.id", "DESC")
  .take(10)
  .getMany()
```

## Migrations

### Criar Migration

```bash
typeorm migration:create -n CreateUsersTable
```

### Exemplo de Migration

```typescript
import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateUsersTable1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "firstName",
            type: "varchar",
          },
          {
            name: "lastName",
            type: "varchar",
          },
          {
            name: "isActive",
            type: "boolean",
            default: true,
          },
        ],
      }),
      true
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("users")
  }
}
```

### Executar Migrations

```bash
# Executar migrations pendentes
typeorm migration:run

# Reverter última migration
typeorm migration:revert
```

## Subscribers

### Exemplo de Subscriber

```typescript
import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent } from "typeorm"
import { User } from "./entity/User"

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User
  }

  beforeInsert(event: InsertEvent<User>) {
    console.log(`BEFORE USER INSERTED: `, event.entity)
  }

  beforeUpdate(event: UpdateEvent<User>) {
    console.log(`BEFORE USER UPDATED: `, event.entity)
  }

  beforeRemove(event: RemoveEvent<User>) {
    console.log(`BEFORE USER REMOVED: `, event.entity)
  }
}
```

## Listeners

### Listeners de Entidade

```typescript
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, AfterLoad } from "typeorm"

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  email: string

  @BeforeInsert()
  beforeInsert() {
    this.email = this.email.toLowerCase()
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.email = this.email.toLowerCase()
  }

  @AfterLoad()
  afterLoad() {
    console.log("User loaded:", this.id)
  }
}
```

## Transações

### Transação Simples

```typescript
const queryRunner = AppDataSource.createQueryRunner()
await queryRunner.connect()
await queryRunner.startTransaction()

try {
  await queryRunner.manager.save(user1)
  await queryRunner.manager.save(user2)
  await queryRunner.commitTransaction()
} catch (err) {
  await queryRunner.rollbackTransaction()
} finally {
  await queryRunner.release()
}
```

### Transação com Repository

```typescript
await AppDataSource.transaction(async (manager) => {
  await manager.save(User, user1)
  await manager.save(User, user2)
})
```

## Query Builder Avançado

### Joins

```typescript
const users = await userRepository
  .createQueryBuilder("user")
  .leftJoinAndSelect("user.photos", "photo")
  .where("user.isActive = :isActive", { isActive: true })
  .getMany()
```

### Subqueries

```typescript
const users = await userRepository
  .createQueryBuilder("user")
  .where("user.id IN " + 
    userRepository
      .createQueryBuilder("user")
      .select("user.id")
      .where("user.isActive = :isActive", { isActive: true })
      .getQuery()
  )
  .setParameter("isActive", true)
  .getMany()
```

### Raw Queries

```typescript
const users = await userRepository.query(
  "SELECT * FROM users WHERE isActive = $1",
  [true]
)
```

## Configurações Avançadas

### Múltiplas Conexões

```typescript
const MysqlDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "test",
  password: "test",
  database: "test",
  entities: [],
})

const PostgresDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "test",
  password: "test",
  database: "test",
  entities: [],
})
```

### Configuração de Pool

```typescript
const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "test",
  password: "test",
  database: "test",
  entities: [],
  extra: {
    connectionLimit: 10,
  },
})
```

## Índices e Constraints

### Índices

```typescript
import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm"

@Entity()
@Index(["firstName", "lastName"])
@Index(["email"], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  email: string
}
```

### Constraints

```typescript
import { Entity, PrimaryGeneratedColumn, Column, Unique, Check } from "typeorm"

@Entity()
@Unique(["firstName", "lastName"])
@Check(`"age" > 18`)
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  age: number
}
```

## Logging

### Configuração de Logging

```typescript
const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "test",
  password: "test",
  database: "test",
  entities: [],
  logging: true,
  logger: "advanced-console",
})
```

## Cache

### Configuração de Cache

```typescript
const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "test",
  password: "test",
  database: "test",
  entities: [],
  cache: {
    type: "redis",
    options: {
      host: "localhost",
      port: 6379,
    },
  },
})
```

## Boas Práticas

1. **Use Decorators**: Prefira decorators sobre configuração manual
2. **Separe Entidades**: Mantenha entidades em arquivos separados
3. **Use Migrations**: Sempre use migrations para mudanças no schema
4. **Valide Dados**: Use validação antes de salvar
5. **Use Transactions**: Use transações para operações críticas
6. **Otimize Queries**: Use query builder para queries complexas
7. **Monitore Performance**: Use logging para monitorar performance
8. **Teste**: Escreva testes para suas entidades e repositories

## Recursos Adicionais

- [Documentação Oficial](https://typeorm.io/)
- [GitHub Repository](https://github.com/typeorm/typeorm)
- [Exemplos](https://github.com/typeorm/typeorm/tree/master/sample)
- [Discord Community](https://discord.gg/typeorm) 