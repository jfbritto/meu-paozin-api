import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesService } from './application/services/clientes.service';
import { ClientesController } from './application/controllers/clientes.controller';
import { Cliente } from '../../infrastructure/database/entities/cliente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cliente]),
  ],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService],
})
export class ClientesModule {} 