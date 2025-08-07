import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido, StatusPedido } from '../../../../infrastructure/database/entities/pedido.entity';
import { IPedidoRepository } from '../../domain/repositories/pedido.repository.interface';

@Injectable()
export class PedidoRepository implements IPedidoRepository {
  constructor(
    @InjectRepository(Pedido)
    private readonly repository: Repository<Pedido>,
  ) {}

  async findById(id: number): Promise<Pedido> {
    const pedido = await this.repository.findOne({
      where: { id },
      relations: ['cliente', 'tipoPao'],
    });
    
    if (!pedido) {
      throw new Error(`Pedido com ID ${id} não encontrado`);
    }
    
    return pedido;
  }

  async findAll(): Promise<Pedido[]> {
    return this.repository.find({
      relations: ['cliente', 'tipoPao'],
      order: { dataPedido: 'DESC' },
    });
  }

  async save(pedido: Pedido): Promise<Pedido> {
    return this.repository.save(pedido);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findByStatus(status: StatusPedido): Promise<Pedido[]> {
    return this.repository.find({
      where: { status },
      relations: ['cliente', 'tipoPao'],
      order: { dataPedido: 'DESC' },
    });
  }

  async findByCliente(clienteId: number): Promise<Pedido[]> {
    return this.repository.find({
      where: { clienteId },
      relations: ['cliente', 'tipoPao'],
      order: { dataPedido: 'DESC' },
    });
  }

  async findByTipoPao(tipoPaoId: number): Promise<Pedido[]> {
    return this.repository.find({
      where: { tipoPaoId },
      relations: ['cliente', 'tipoPao'],
      order: { dataPedido: 'DESC' },
    });
  }

  async getPedidosRecentes(limit: number = 10): Promise<Pedido[]> {
    return this.repository.find({
      relations: ['cliente', 'tipoPao'],
      order: { dataPedido: 'DESC' },
      take: limit,
    });
  }
} 