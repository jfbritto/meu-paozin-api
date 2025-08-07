import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { StatusPedido } from '../../database/entities/pedido.entity';

@Injectable()
export class KafkaProducerService {
  private producer: any;

  constructor() {
    const kafka = new Kafka({
      clientId: 'meupaozin-api',
      brokers: ['localhost:9092'],
    });

    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      console.log('✅ Produtor Kafka conectado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao conectar produtor Kafka:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      console.log('✅ Produtor Kafka desconectado');
    } catch (error) {
      console.error('❌ Erro ao desconectar produtor Kafka:', error);
    }
  }

  private async sendEvent({ topic, key, value }: { topic: string; key: string; value: any }): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key,
            value: JSON.stringify(value),
          },
        ],
      });
    } catch (error) {
      console.error(`❌ Erro ao enviar evento para tópico ${topic}:`, error);
      throw error;
    }
  }

  async sendPedidoCreated(pedido: any): Promise<void> {
    await this.sendEvent({
      topic: 'pedidos.created',
      key: `pedido-${pedido.id}`,
      value: {
        eventType: 'PEDIDO_CREATED',
        pedidoId: pedido.id,
        clienteId: pedido.cliente_id,
        tipoPaoId: pedido.tipo_pao_id,
        quantidade: pedido.quantidade,
        precoTotal: pedido.preco_total,
        status: pedido.status,
        observacoes: pedido.observacoes,
        dataPedido: pedido.data_pedido,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async sendPedidoUpdated(pedido: any, previousStatus?: StatusPedido): Promise<void> {
    await this.sendEvent({
      topic: 'pedidos.updated',
      key: `pedido-${pedido.id}`,
      value: {
        eventType: 'PEDIDO_UPDATED',
        pedidoId: pedido.id,
        clienteId: pedido.cliente_id,
        tipoPaoId: pedido.tipo_pao_id,
        quantidade: pedido.quantidade,
        precoTotal: pedido.preco_total,
        status: pedido.status,
        previousStatus: previousStatus,
        dataAtualizacao: pedido.data_atualizacao,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async sendPedidoCancelled(pedido: any): Promise<void> {
    await this.sendEvent({
      topic: 'pedidos.cancelled',
      key: `pedido-${pedido.id}`,
      value: {
        eventType: 'PEDIDO_CANCELLED',
        pedidoId: pedido.id,
        clienteId: pedido.cliente_id,
        tipoPaoId: pedido.tipo_pao_id,
        quantidade: pedido.quantidade,
        precoTotal: pedido.preco_total,
        status: pedido.status,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async sendClienteCreated(cliente: any): Promise<void> {
    await this.sendEvent({
      topic: 'clientes.created',
      key: `cliente-${cliente.id}`,
      value: {
        eventType: 'CLIENTE_CREATED',
        clienteId: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        endereco: cliente.endereco,
        dataCriacao: cliente.data_criacao,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async sendClienteUpdated(cliente: any): Promise<void> {
    await this.sendEvent({
      topic: 'clientes.updated',
      key: `cliente-${cliente.id}`,
      value: {
        eventType: 'CLIENTE_UPDATED',
        clienteId: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        endereco: cliente.endereco,
        dataAtualizacao: cliente.data_atualizacao,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async sendClienteDeleted(clienteId: number): Promise<void> {
    await this.sendEvent({
      topic: 'clientes.deleted',
      key: `cliente-${clienteId}`,
      value: {
        eventType: 'CLIENTE_DELETED',
        clienteId: clienteId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async sendTipoPaoCreated(tipoPao: any): Promise<void> {
    await this.sendEvent({
      topic: 'tipos-pao.created',
      key: `tipo-pao-${tipoPao.id}`,
      value: {
        eventType: 'TIPO_PAO_CREATED',
        tipoPaoId: tipoPao.id,
        nome: tipoPao.nome,
        descricao: tipoPao.descricao,
        precoBase: tipoPao.preco_base,
        ativo: tipoPao.ativo,
        dataCriacao: tipoPao.data_criacao,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async sendTipoPaoUpdated(tipoPao: any): Promise<void> {
    await this.sendEvent({
      topic: 'tipos-pao.updated',
      key: `tipo-pao-${tipoPao.id}`,
      value: {
        eventType: 'TIPO_PAO_UPDATED',
        tipoPaoId: tipoPao.id,
        nome: tipoPao.nome,
        descricao: tipoPao.descricao,
        precoBase: tipoPao.preco_base,
        ativo: tipoPao.ativo,
        dataAtualizacao: tipoPao.data_atualizacao,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async sendTipoPaoDeleted(tipoPaoId: number): Promise<void> {
    await this.sendEvent({
      topic: 'tipos-pao.deleted',
      key: `tipo-pao-${tipoPaoId}`,
      value: {
        eventType: 'TIPO_PAO_DELETED',
        tipoPaoId: tipoPaoId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async sendAnalyticsEvent(data: any): Promise<void> {
    await this.sendEvent({
      topic: 'analytics.events',
      key: `analytics-${Date.now()}`,
      value: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async sendNotificationEvent(data: any): Promise<void> {
    await this.sendEvent({
      topic: 'notifications.events',
      key: `notification-${Date.now()}`,
      value: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async sendAuditEvent(data: any): Promise<void> {
    await this.sendEvent({
      topic: 'audit.events',
      key: `audit-${Date.now()}`,
      value: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    });
  }
} 