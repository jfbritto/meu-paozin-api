export const appConfig = () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'pedidos_db',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || 'meu-paozin-api',
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    groupId: process.env.KAFKA_GROUP_ID || 'meu-paozin-group',
  },
  swagger: {
    title: 'MeuPaoZin API',
    description: 'API para gerenciamento de pedidos de pães',
    version: '2.0.0',
  },
}); 