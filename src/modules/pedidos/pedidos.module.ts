import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosService } from './application/services/pedidos.service';
import { PedidosController } from './application/controllers/pedidos.controller';
import { Pedido } from '../../infrastructure/database/entities/pedido.entity';
import { Cliente } from '../../infrastructure/database/entities/cliente.entity';
import { TipoPao } from '../../infrastructure/database/entities/tipo-pao.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido, Cliente, TipoPao]),
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}
