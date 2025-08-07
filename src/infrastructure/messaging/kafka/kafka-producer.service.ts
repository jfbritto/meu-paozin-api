import { Injectable } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { StatusPedido } from '../../database/entities/pedido.entity';

export interface KafkaEvent {
  topic: string;
  key?: string;
  value: any;
  headers?: Record<string, string>;
}

@Injectable()
export class KafkaProducerService {
  constructor(private kafkaService: KafkaService) {}

  async sendEvent(event: KafkaEvent): Promise<void> {
    try {
      const producer = this.kafkaService.getProducer();
      
      await producer.send({
        topic: event.topic,
        messages: [
          {
            key: event.key,
            value: JSON.stringify(event.value),
            headers: event.headers,
          },
        ],
      });

      console.log(`📤 Evento enviado para tópico: ${event.topic}`);
    } catch (error) {
      console.error(`❌ Erro ao enviar evento para ${event.topic}:`, error);
      // Não re-throw o erro para não afetar a operação principal
      // Implementar retry logic aqui no futuro
    }
  }

  // ===== EVENTOS DE PEDIDOS =====
  async sendPedidoCreated(pedido: any): Promise<void> {
    await this.sendEvent({
      topic: 'pedidos.created',
      key: `pedido-${pedido.id}`,
      value: {
        eventType: 'PEDIDO_CREATED',
        pedidoId: pedido.id,
        clienteId: pedido.clienteId,
        tipoPaoId: pedido.tipoPaoId,
        quantidade: pedido.quantidade,
        precoTotal: pedido.precoTotal,
        status: pedido.status,
        dataPedido: pedido.dataPedido,
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
        clienteId: pedido.clienteId,
        tipoPaoId: pedido.tipoPaoId,
        quantidade: pedido.quantidade,
        precoTotal: pedido.precoTotal,
        status: pedido.status,
        previousStatus: previousStatus,
        dataAtualizacao: pedido.dataAtualizacao,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async sendPedidoStatusChanged(pedido: any, previousStatus: StatusPedido): Promise<void> {
    await this.sendEvent({
      topic: 'pedidos.status-changed',
      key: `pedido-${pedido.id}`,
      value: {
        eventType: 'PEDIDO_STATUS_CHANGED',
        pedidoId: pedido.id,
        clienteId: pedido.clienteId,
        previousStatus: previousStatus,
        newStatus: pedido.status,
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
        clienteId: pedido.clienteId,
        status: pedido.status,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // ===== EVENTOS DE CLIENTES =====
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
        timestamp: new Date().toISOString(),
      },
    });
  }

  async sendClienteUpdated(cliente: any, previousData?: any): Promise<void> {
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
        previousData: previousData,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async sendClienteDeleted(cliente: any): Promise<void> {
    await this.sendEvent({
      topic: 'clientes.deleted',
      key: `cliente-${cliente.id}`,
      value: {
        eventType: 'CLIENTE_DELETED',
        clienteId: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // ===== EVENTOS DE TIPOS DE PÃO =====
  async sendTipoPaoCreated(tipoPao: any): Promise<void> {
    await this.sendEvent({
      topic: 'tipos-pao.created',
      key: `tipo-pao-${tipoPao.id}`,
      value: {
        eventType: 'TIPO_PAO_CREATED',
        tipoPaoId: tipoPao.id,
        nome: tipoPao.nome,
        descricao: tipoPao.descricao,
        precoBase: tipoPao.precoBase,
        ativo: tipoPao.ativo,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async sendTipoPaoUpdated(tipoPao: any, previousData?: any): Promise<void> {
    await this.sendEvent({
      topic: 'tipos-pao.updated',
      key: `tipo-pao-${tipoPao.id}`,
      value: {
        eventType: 'TIPO_PAO_UPDATED',
        tipoPaoId: tipoPao.id,
        nome: tipoPao.nome,
        descricao: tipoPao.descricao,
        precoBase: tipoPao.precoBase,
        ativo: tipoPao.ativo,
        previousData: previousData,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async sendTipoPaoDeleted(tipoPao: any): Promise<void> {
    await this.sendEvent({
      topic: 'tipos-pao.deleted',
      key: `tipo-pao-${tipoPao.id}`,
      value: {
        eventType: 'TIPO_PAO_DELETED',
        tipoPaoId: tipoPao.id,
        nome: tipoPao.nome,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // ===== EVENTOS DE ANALYTICS =====
  async sendAnalyticsEvent(eventData: any): Promise<void> {
    await this.sendEvent({
      topic: 'analytics.events',
      value: {
        ...eventData,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // ===== EVENTOS DE NOTIFICAÇÕES =====
  async sendNotificationEvent(userId: number, type: string, message: string, data?: any): Promise<void> {
    await this.sendEvent({
      topic: 'notifications.events',
      key: `user-${userId}`,
      value: {
        eventType: 'NOTIFICATION_SENT',
        userId: userId,
        notificationType: type,
        message: message,
        data: data,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // ===== EVENTOS DE AUDITORIA =====
  async sendAuditEvent(action: string, entity: string, entityId: number, userId?: number, details?: any): Promise<void> {
    await this.sendEvent({
      topic: 'audit.events',
      value: {
        eventType: 'AUDIT_LOG',
        action: action,
        entity: entity,
        entityId: entityId,
        userId: userId,
        details: details,
        timestamp: new Date().toISOString(),
      },
    });
  }
} 