import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';
import { Pedido } from '../infrastructure/database/entities/pedido.entity';
import { Cliente } from '../infrastructure/database/entities/cliente.entity';
import { TipoPao } from '../infrastructure/database/entities/tipo-pao.entity';

class SnakeNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  tableName(targetName: string, userSpecifiedName: string | undefined): string {
    return userSpecifiedName ? userSpecifiedName : targetName.toLowerCase();
  }

  columnName(propertyName: string, objectName: string, embeddedPrefixes: string[]): string {
    return propertyName.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  relationName(propertyName: string): string {
    return propertyName.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  joinColumnName(relationName: string, referencedColumnName: string): string {
    return relationName.replace(/([A-Z])/g, '_$1').toLowerCase() + '_' + referencedColumnName;
  }

  joinTableName(firstTableName: string, secondTableName: string, firstPropertyName: string, secondPropertyName: string): string {
    return firstTableName.toLowerCase() + '_' + secondTableName.toLowerCase();
  }

  joinTableColumnName(tableName: string, propertyName: string, columnName?: string): string {
    return tableName.toLowerCase() + '_' + (columnName ? columnName : propertyName.replace(/([A-Z])/g, '_$1').toLowerCase());
  }
}

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'pedidos_db',
  entities: [Pedido, Cliente, TipoPao],
  synchronize: false, // Desabilitado temporariamente
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  namingStrategy: new SnakeNamingStrategy(),
}); 