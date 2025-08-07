import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiposPaoService } from './application/services/tipos-pao.service';
import { TiposPaoController } from './application/controllers/tipos-pao.controller';
import { TipoPao } from '../../infrastructure/database/entities/tipo-pao.entity';
import { KafkaModule } from '../../infrastructure/messaging/kafka/kafka.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TipoPao]),
    KafkaModule,
  ],
  controllers: [TiposPaoController],
  providers: [TiposPaoService],
  exports: [TiposPaoService],
})
export class TiposPaoModule {} 