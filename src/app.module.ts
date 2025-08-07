import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PedidosModule } from './modules/pedidos/pedidos.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { TiposPaoModule } from './modules/tipos-pao/tipos-pao.module';
import { KafkaModule } from './infrastructure/messaging/kafka/kafka.module';
// import { DatadogModule } from './infrastructure/observability/datadog/datadog.module';
import { databaseConfig } from './config/database.config';
import { appConfig } from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    TypeOrmModule.forRoot(databaseConfig()),
    KafkaModule,
    // DatadogModule,
    PedidosModule,
    ClientesModule,
    TiposPaoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
