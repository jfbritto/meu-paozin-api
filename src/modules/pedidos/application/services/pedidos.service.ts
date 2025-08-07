import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido, StatusPedido } from '../../../../infrastructure/database/entities/pedido.entity';
import { Cliente } from '../../../../infrastructure/database/entities/cliente.entity';
import { TipoPao } from '../../../../infrastructure/database/entities/tipo-pao.entity';
import { CreatePedidoDto } from '../dto/create-pedido.dto';
import { UpdatePedidoDto } from '../dto/update-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(TipoPao)
    private readonly tipoPaoRepository: Repository<TipoPao>,
  ) {}

  async create(createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    // Verificar se o cliente existe
    const cliente = await this.clienteRepository.findOne({
      where: { id: createPedidoDto.cliente_id }
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${createPedidoDto.cliente_id} não encontrado`);
    }

    // Verificar se o tipo de pão existe e está ativo
    const tipoPao = await this.tipoPaoRepository.findOne({
      where: { id: createPedidoDto.tipo_pao_id, ativo: true }
    });
    if (!tipoPao) {
      throw new NotFoundException(`Tipo de pão com ID ${createPedidoDto.tipo_pao_id} não encontrado ou inativo`);
    }

    // Definir status padrão se não fornecido
    const status = createPedidoDto.status || StatusPedido.REALIZADO;

    // Calcular preço total
    const preco_total = tipoPao.preco_base * createPedidoDto.quantidade;

    const pedido = this.pedidoRepository.create({
      ...createPedidoDto,
      status,
      preco_total
    });

    const savedPedido = await this.pedidoRepository.save(pedido);

    return savedPedido;
  }

  async findAll(): Promise<Pedido[]> {
    return await this.pedidoRepository.find({
      relations: ['cliente', 'tipo_pao'],
      order: { data_pedido: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Pedido> {
    const pedido = await this.pedidoRepository.findOne({
      where: { id },
      relations: ['cliente', 'tipo_pao'],
    });
    
    if (!pedido) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }
    
    return pedido;
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto): Promise<Pedido> {
    const pedido = await this.findOne(id);

    // Verificar se o cliente existe (se estiver sendo atualizado)
    if (updatePedidoDto.cliente_id) {
      const cliente = await this.clienteRepository.findOne({
        where: { id: updatePedidoDto.cliente_id }
      });
      if (!cliente) {
        throw new NotFoundException(`Cliente com ID ${updatePedidoDto.cliente_id} não encontrado`);
      }
    }

    // Verificar se o tipo de pão existe e está ativo (se estiver sendo atualizado)
    if (updatePedidoDto.tipo_pao_id) {
      const tipoPao = await this.tipoPaoRepository.findOne({
        where: { id: updatePedidoDto.tipo_pao_id, ativo: true }
      });
      if (!tipoPao) {
        throw new NotFoundException(`Tipo de pão com ID ${updatePedidoDto.tipo_pao_id} não encontrado ou inativo`);
      }
    }

    // Recalcular preço total se quantidade ou tipo de pão foram alterados
    if (updatePedidoDto.quantidade || updatePedidoDto.tipo_pao_id) {
      const tipoPaoId = updatePedidoDto.tipo_pao_id || pedido.tipo_pao_id;
      const quantidade = updatePedidoDto.quantidade || pedido.quantidade;
      
      const tipoPao = await this.tipoPaoRepository.findOne({
        where: { id: tipoPaoId }
      });
      
      if (tipoPao) {
        updatePedidoDto.preco_total = tipoPao.preco_base * quantidade;
      }
    }

    Object.assign(pedido, updatePedidoDto);
    const updatedPedido = await this.pedidoRepository.save(pedido);

    return updatedPedido;
  }

  async remove(id: number): Promise<void> {
    const pedido = await this.findOne(id);
    await this.pedidoRepository.remove(pedido);
  }

  async findByStatus(status: StatusPedido): Promise<Pedido[]> {
    return await this.pedidoRepository.find({
      where: { status },
      relations: ['cliente', 'tipo_pao'],
      order: { data_pedido: 'DESC' }
    });
  }

  async getPedidosRecentes(limit: number = 10): Promise<Pedido[]> {
    return await this.pedidoRepository.find({
      relations: ['cliente', 'tipo_pao'],
      order: { data_pedido: 'DESC' },
      take: limit
    });
  }

  async findByCliente(cliente_id: number): Promise<Pedido[]> {
    return await this.pedidoRepository.find({
      where: { cliente_id },
      relations: ['cliente', 'tipo_pao'],
      order: { data_pedido: 'DESC' }
    });
  }

  async findByTipoPao(tipo_pao_id: number): Promise<Pedido[]> {
    return await this.pedidoRepository.find({
      where: { tipo_pao_id },
      relations: ['cliente', 'tipo_pao'],
      order: { data_pedido: 'DESC' }
    });
  }

  getStatusDisponiveis(): StatusPedido[] {
    return Object.values(StatusPedido);
  }
}
