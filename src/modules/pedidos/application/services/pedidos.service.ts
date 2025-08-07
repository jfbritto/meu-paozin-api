import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido, StatusPedido } from '../../../../infrastructure/database/entities/pedido.entity';
import { Cliente } from '../../../../infrastructure/database/entities/cliente.entity';
import { TipoPao } from '../../../../infrastructure/database/entities/tipo-pao.entity';
import { CreatePedidoDto } from '../dto/create-pedido.dto';
import { UpdatePedidoDto } from '../dto/update-pedido.dto';
import { KafkaProducerService } from '../../../../infrastructure/messaging/kafka/kafka-producer.service';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(TipoPao)
    private readonly tipoPaoRepository: Repository<TipoPao>,
    private readonly kafkaProducer: KafkaProducerService,
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

    // Enviar evento Kafka para pedido criado
    try {
      await this.kafkaProducer.sendPedidoCreated(savedPedido);
      
      // Enviar evento de analytics
      await this.kafkaProducer.sendAnalyticsEvent({
        eventType: 'PEDIDO_CREATED_ANALYTICS',
        pedidoId: savedPedido.id,
        clienteId: savedPedido.cliente_id,
        tipoPaoId: savedPedido.tipo_pao_id,
        quantidade: savedPedido.quantidade,
        precoTotal: savedPedido.preco_total,
        status: savedPedido.status,
      });
    } catch (error) {
      console.error('❌ Erro ao enviar eventos Kafka:', error);
      // Não falhar a operação principal se o Kafka falhar
    }

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
    const previousStatus = pedido.status;

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

    // Enviar evento Kafka para pedido atualizado
    try {
      await this.kafkaProducer.sendPedidoUpdated(updatedPedido, previousStatus);
      
      // Enviar evento de analytics
      await this.kafkaProducer.sendAnalyticsEvent({
        eventType: 'PEDIDO_UPDATED_ANALYTICS',
        pedidoId: updatedPedido.id,
        clienteId: updatedPedido.cliente_id,
        tipoPaoId: updatedPedido.tipo_pao_id,
        quantidade: updatedPedido.quantidade,
        precoTotal: updatedPedido.preco_total,
        status: updatedPedido.status,
        previousStatus: previousStatus,
      });
    } catch (error) {
      console.error('❌ Erro ao enviar eventos Kafka:', error);
      // Não falhar a operação principal se o Kafka falhar
    }

    return updatedPedido;
  }

  async remove(id: number): Promise<void> {
    const pedido = await this.findOne(id);
    
    // Enviar evento Kafka para pedido cancelado
    try {
      await this.kafkaProducer.sendPedidoCancelled(pedido);
      
      // Enviar evento de analytics
      await this.kafkaProducer.sendAnalyticsEvent({
        eventType: 'PEDIDO_CANCELLED_ANALYTICS',
        pedidoId: pedido.id,
        clienteId: pedido.cliente_id,
        tipoPaoId: pedido.tipo_pao_id,
        quantidade: pedido.quantidade,
        precoTotal: pedido.preco_total,
        status: pedido.status,
      });
    } catch (error) {
      console.error('❌ Erro ao enviar eventos Kafka:', error);
      // Não falhar a operação principal se o Kafka falhar
    }

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
