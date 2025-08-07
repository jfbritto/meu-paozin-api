import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido, StatusPedido } from '../../../../infrastructure/database/entities/pedido.entity';
import { CreatePedidoDto } from '../dto/create-pedido.dto';
import { UpdatePedidoDto } from '../dto/update-pedido.dto';
import { Cliente } from '../../../../infrastructure/database/entities/cliente.entity';
import { TipoPao } from '../../../../infrastructure/database/entities/tipo-pao.entity';
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
      where: { id: createPedidoDto.clienteId }
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${createPedidoDto.clienteId} não encontrado`);
    }

    // Verificar se o tipo de pão existe e está ativo
    const tipoPao = await this.tipoPaoRepository.findOne({
      where: { id: createPedidoDto.tipoPaoId, ativo: true }
    });
    if (!tipoPao) {
      throw new NotFoundException(`Tipo de pão com ID ${createPedidoDto.tipoPaoId} não encontrado ou inativo`);
    }

    // Definir status padrão se não fornecido
    const status = createPedidoDto.status || StatusPedido.REALIZADO;

    // Calcular preço total
    const precoTotal = tipoPao.precoBase * createPedidoDto.quantidade;

    const pedido = this.pedidoRepository.create({
      ...createPedidoDto,
      status,
      precoTotal
    });

    const savedPedido = await this.pedidoRepository.save(pedido);

    // Enviar evento Kafka para pedido criado
    try {
      await this.kafkaProducer.sendPedidoCreated(savedPedido);
      
      // Enviar evento de analytics
      await this.kafkaProducer.sendAnalyticsEvent({
        eventType: 'PEDIDO_CREATED_ANALYTICS',
        pedidoId: savedPedido.id,
        clienteId: savedPedido.clienteId,
        tipoPaoId: savedPedido.tipoPaoId,
        quantidade: savedPedido.quantidade,
        precoTotal: savedPedido.precoTotal,
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
      relations: ['cliente', 'tipoPao'],
      order: { dataPedido: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Pedido> {
    const pedido = await this.pedidoRepository.findOne({
      where: { id },
      relations: ['cliente', 'tipoPao']
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
    if (updatePedidoDto.clienteId) {
      const cliente = await this.clienteRepository.findOne({
        where: { id: updatePedidoDto.clienteId }
      });
      if (!cliente) {
        throw new NotFoundException(`Cliente com ID ${updatePedidoDto.clienteId} não encontrado`);
      }
    }

    // Verificar se o tipo de pão existe e está ativo (se estiver sendo atualizado)
    if (updatePedidoDto.tipoPaoId) {
      const tipoPao = await this.tipoPaoRepository.findOne({
        where: { id: updatePedidoDto.tipoPaoId, ativo: true }
      });
      if (!tipoPao) {
        throw new NotFoundException(`Tipo de pão com ID ${updatePedidoDto.tipoPaoId} não encontrado ou inativo`);
      }
    }

    // Recalcular preço total se quantidade ou tipo de pão foram alterados
    if (updatePedidoDto.quantidade || updatePedidoDto.tipoPaoId) {
      const tipoPaoId = updatePedidoDto.tipoPaoId || pedido.tipoPaoId;
      const quantidade = updatePedidoDto.quantidade || pedido.quantidade;
      
      const tipoPao = await this.tipoPaoRepository.findOne({
        where: { id: tipoPaoId }
      });
      
      if (tipoPao) {
        updatePedidoDto.precoTotal = tipoPao.precoBase * quantidade;
      }
    }

    Object.assign(pedido, updatePedidoDto);
    const updatedPedido = await this.pedidoRepository.save(pedido);

    // Enviar eventos Kafka
    try {
      await this.kafkaProducer.sendPedidoUpdated(updatedPedido, previousStatus);
      
      // Se o status mudou, enviar evento específico
      if (updatePedidoDto.status && updatePedidoDto.status !== previousStatus) {
        await this.kafkaProducer.sendPedidoStatusChanged(updatedPedido, previousStatus);
      }

      // Enviar evento de analytics
      await this.kafkaProducer.sendAnalyticsEvent({
        eventType: 'PEDIDO_UPDATED_ANALYTICS',
        pedidoId: updatedPedido.id,
        clienteId: updatedPedido.clienteId,
        previousStatus: previousStatus,
        newStatus: updatedPedido.status,
        changes: updatePedidoDto,
      });
    } catch (error) {
      console.error('❌ Erro ao enviar eventos Kafka:', error);
    }

    return updatedPedido;
  }

  async remove(id: number): Promise<void> {
    try {
      const pedido = await this.findOne(id);
      await this.pedidoRepository.remove(pedido);

      // Enviar evento Kafka para pedido removido
      try {
        await this.kafkaProducer.sendPedidoCancelled(pedido);
        
        // Enviar evento de analytics
        await this.kafkaProducer.sendAnalyticsEvent({
          eventType: 'PEDIDO_CANCELLED_ANALYTICS',
          pedidoId: pedido.id,
          clienteId: pedido.clienteId,
          status: pedido.status,
        });
      } catch (error) {
        console.error('❌ Erro ao enviar eventos Kafka:', error);
        // Não re-throw o erro para não afetar a operação principal
      }
    } catch (error) {
      console.error('❌ Erro ao remover pedido:', error);
      throw error;
    }
  }

  async findByStatus(status: StatusPedido): Promise<Pedido[]> {
    return await this.pedidoRepository.find({
      where: { status },
      relations: ['cliente', 'tipoPao'],
      order: { dataPedido: 'DESC' }
    });
  }

  async findByCliente(clienteId: number): Promise<Pedido[]> {
    return await this.pedidoRepository.find({
      where: { clienteId },
      relations: ['cliente', 'tipoPao'],
      order: { dataPedido: 'DESC' }
    });
  }

  async findByTipoPao(tipoPaoId: number): Promise<Pedido[]> {
    return await this.pedidoRepository.find({
      where: { tipoPaoId },
      relations: ['cliente', 'tipoPao'],
      order: { dataPedido: 'DESC' }
    });
  }

  async getPedidosRecentes(limit?: number): Promise<Pedido[]> {
    // Definir valor padrão se não fornecido
    const defaultLimit = 10;
    const finalLimit = limit || defaultLimit;
    
    return await this.pedidoRepository.find({
      relations: ['cliente', 'tipoPao'],
      order: { dataPedido: 'DESC' },
      take: finalLimit
    });
  }
}
