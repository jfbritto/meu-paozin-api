# PostgreSQL (pg)

## Visão Geral

PostgreSQL é um sistema de gerenciamento de banco de dados objeto relacional (SGBDOR) desenvolvido como projeto de código aberto. O driver `pg` para Node.js é a biblioteca oficial para conectar aplicações Node.js ao PostgreSQL.

## Características Principais

- **ACID Compliance**: Transações atômicas, consistentes, isoladas e duráveis
- **Tipos de Dados Avançados**: JSON, arrays, UUID, geometric, etc.
- **Extensibilidade**: Sistema de extensões rico
- **Performance**: Otimizado para cargas de trabalho complexas
- **Concorrência**: Suporte robusto a múltiplos usuários
- **Open Source**: Licença PostgreSQL

## Instalação

```bash
npm install pg
npm install @types/pg --save-dev
```

## Conexão Básica

### Conexão Simples

```typescript
import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'meu_paozin',
  user: 'postgres',
  password: 'password'
});

async function connect() {
  try {
    await client.connect();
    console.log('Conectado ao PostgreSQL');
  } catch (err) {
    console.error('Erro na conexão:', err);
  }
}

connect();
```

### Pool de Conexões

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'meu_paozin',
  user: 'postgres',
  password: 'password',
  max: 20, // máximo de conexões
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Usar o pool
async function query() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users');
    return result.rows;
  } finally {
    client.release();
  }
}
```

## Executando Queries

### Query Simples

```typescript
import { Pool } from 'pg';

const pool = new Pool();

async function getUsers() {
  try {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
  } catch (err) {
    console.error('Erro na query:', err);
    throw err;
  }
}
```

### Query com Parâmetros

```typescript
async function getUserById(id: number) {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  } catch (err) {
    console.error('Erro na query:', err);
    throw err;
  }
}

async function createUser(name: string, email: string) {
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    return result.rows[0];
  } catch (err) {
    console.error('Erro na inserção:', err);
    throw err;
  }
}
```

### Múltiplas Queries

```typescript
async function createUserWithProfile(userData: any, profileData: any) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const userResult = await client.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id',
      [userData.name, userData.email]
    );
    
    const userId = userResult.rows[0].id;
    
    await client.query(
      'INSERT INTO profiles (user_id, bio, avatar) VALUES ($1, $2, $3)',
      [userId, profileData.bio, profileData.avatar]
    );
    
    await client.query('COMMIT');
    
    return { userId, success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

## Tipos de Dados PostgreSQL

### Tipos Básicos

```typescript
// String
const name = 'João Silva';

// Number
const age = 25;
const price = 19.99;

// Boolean
const isActive = true;

// Date
const createdAt = new Date();

// JSON
const metadata = { preferences: { theme: 'dark' } };

// Array
const tags = ['tag1', 'tag2', 'tag3'];
```

### Tipos Específicos do PostgreSQL

```typescript
// UUID
import { v4 as uuidv4 } from 'uuid';
const userId = uuidv4();

// JSONB (JSON binário - mais eficiente)
const jsonData = { key: 'value', nested: { data: true } };

// Geometric
const point = '(10, 20)';
const circle = '<(10, 20), 5>';

// Text Search
const searchQuery = 'postgresql & database';
```

## Estrutura de Tabelas

### Criando Tabelas

```sql
-- Tabela de usuários
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  category_id INTEGER REFERENCES categories(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Índices

```sql
-- Índice simples
CREATE INDEX idx_users_email ON users(email);

-- Índice composto
CREATE INDEX idx_products_category_price ON products(category_id, price);

-- Índice único
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- Índice para JSONB
CREATE INDEX idx_products_metadata ON products USING GIN (metadata);

-- Índice para busca de texto
CREATE INDEX idx_products_name_search ON products USING GIN (to_tsvector('portuguese', name));
```

## Queries Avançadas

### JOINs

```typescript
async function getProductsWithCategory() {
  const query = `
    SELECT 
      p.id,
      p.name,
      p.price,
      c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `;
  
  const result = await pool.query(query);
  return result.rows;
}
```

### Agregações

```typescript
async function getProductStats() {
  const query = `
    SELECT 
      category_id,
      COUNT(*) as total_products,
      AVG(price) as avg_price,
      MIN(price) as min_price,
      MAX(price) as max_price
    FROM products
    GROUP BY category_id
    HAVING COUNT(*) > 5
    ORDER BY avg_price DESC
  `;
  
  const result = await pool.query(query);
  return result.rows;
}
```

### Subqueries

```typescript
async function getExpensiveProducts() {
  const query = `
    SELECT name, price
    FROM products
    WHERE price > (
      SELECT AVG(price) 
      FROM products
    )
    ORDER BY price DESC
  `;
  
  const result = await pool.query(query);
  return result.rows;
}
```

### Window Functions

```typescript
async function getProductRanking() {
  const query = `
    SELECT 
      name,
      price,
      category_id,
      ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) as rank_in_category,
      RANK() OVER (ORDER BY price DESC) as overall_rank
    FROM products
    ORDER BY category_id, price DESC
  `;
  
  const result = await pool.query(query);
  return result.rows;
}
```

## Transações

### Transação Simples

```typescript
async function transferStock(fromProductId: number, toProductId: number, quantity: number) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Verificar estoque disponível
    const stockResult = await client.query(
      'SELECT stock_quantity FROM products WHERE id = $1',
      [fromProductId]
    );
    
    if (stockResult.rows[0].stock_quantity < quantity) {
      throw new Error('Estoque insuficiente');
    }
    
    // Reduzir estoque do produto origem
    await client.query(
      'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
      [quantity, fromProductId]
    );
    
    // Aumentar estoque do produto destino
    await client.query(
      'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
      [quantity, toProductId]
    );
    
    await client.query('COMMIT');
    return { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

## Prepared Statements

```typescript
async function createPreparedStatements() {
  const client = await pool.connect();
  
  try {
    // Preparar statement para inserção
    await client.query(`
      PREPARE insert_user (VARCHAR, VARCHAR, VARCHAR) AS
      INSERT INTO users (name, email, password_hash) 
      VALUES ($1, $2, $3) 
      RETURNING id
    `);
    
    // Preparar statement para busca
    await client.query(`
      PREPARE get_user_by_email (VARCHAR) AS
      SELECT * FROM users WHERE email = $1
    `);
    
    // Usar prepared statements
    const insertResult = await client.query('EXECUTE insert_user($1, $2, $3)', [
      'João Silva',
      'joao@example.com',
      'hashed_password'
    ]);
    
    const userResult = await client.query('EXECUTE get_user_by_email($1)', [
      'joao@example.com'
    ]);
    
    return { inserted: insertResult.rows[0], found: userResult.rows[0] };
  } finally {
    client.release();
  }
}
```

## Configuração de Performance

### Configuração do Pool

```typescript
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'meu_paozin',
  user: 'postgres',
  password: 'password',
  
  // Configurações de performance
  max: 20, // máximo de conexões
  min: 4,  // mínimo de conexões
  idleTimeoutMillis: 30000, // tempo de inatividade
  connectionTimeoutMillis: 2000, // timeout de conexão
  
  // Configurações de SSL
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // Configurações de statement timeout
  statement_timeout: 30000, // 30 segundos
  query_timeout: 30000,
});
```

### Monitoramento

```typescript
pool.on('connect', (client) => {
  console.log('Nova conexão criada');
});

pool.on('error', (err, client) => {
  console.error('Erro inesperado no cliente:', err);
});

pool.on('remove', (client) => {
  console.log('Cliente removido do pool');
});

// Estatísticas do pool
setInterval(() => {
  console.log('Pool stats:', {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  });
}, 5000);
```

## Integração com TypeORM

### Configuração

```typescript
// ormconfig.ts
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'meu_paozin',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // não usar em produção
  logging: true,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
```

### Entity com PostgreSQL

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: object;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
```

## Backup e Restore

### Backup

```bash
# Backup completo
pg_dump -h localhost -U postgres -d meu_paozin > backup.sql

# Backup apenas dados
pg_dump -h localhost -U postgres -d meu_paozin --data-only > data_backup.sql

# Backup apenas estrutura
pg_dump -h localhost -U postgres -d meu_paozin --schema-only > schema_backup.sql
```

### Restore

```bash
# Restore completo
psql -h localhost -U postgres -d meu_paozin < backup.sql

# Restore apenas dados
psql -h localhost -U postgres -d meu_paozin < data_backup.sql
```

## Boas Práticas

1. **Use connection pooling**: Sempre use pools para aplicações em produção
2. **Parametrize queries**: Use parâmetros para evitar SQL injection
3. **Monitore performance**: Use EXPLAIN ANALYZE para otimizar queries
4. **Use índices**: Crie índices apropriados para suas queries
5. **Backup regular**: Faça backups regulares dos dados
6. **Use transações**: Para operações que modificam múltiplas tabelas
7. **Trate erros**: Sempre trate erros de conexão e queries
8. **Use SSL**: Em produção, sempre use SSL para conexões
9. **Configure timeouts**: Configure timeouts apropriados
10. **Log queries**: Em desenvolvimento, log queries para debug 