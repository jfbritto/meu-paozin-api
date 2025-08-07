import { Pedido } from '../../../../infrastructure/database/entities/pedido.entity';
import { StatusPedido } from '../../../../infrastructure/database/entities/pedido.entity';
import { CreatePedidoDto } from '../../application/dto/create-pedido.dto';
import { UpdatePedidoDto } from '../../application/dto/update-pedido.dto';

export interface IPedidoRepository {
  findById(id: number): Promise<Pedido>;
  findAll(): Promise<Pedido[]>;
  save(pedido: Pedido): Promise<Pedido>;
  delete(id: number): Promise<void>;
  findByStatus(status: StatusPedido): Promise<Pedido[]>;
  findByCliente(clienteId: number): Promise<Pedido[]>;
  findByTipoPao(tipoPaoId: number): Promise<Pedido[]>;
  getPedidosRecentes(limit?: number): Promise<Pedido[]>;
} 