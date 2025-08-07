import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { StatusPedido } from '../../database/entities/pedido.entity';

@Injectable()
export class KafkaProducerService {
  private producer: any;
  private isConnected: boolean = false;

  constructor() {
    this.initializeProducer();
  }

  private async initializeProducer() {
    try {
      const kafka = new Kafka({
        clientId: 'meupaozin-api',
        brokers: ['localhost:9092'],
        retry: {
          initialRetryTime: 100,
          retries: 3
        }
      });

      this.producer = kafka.producer();
      await this.producer.connect();
      this.isConnected = true;
      console.log('✅ Produtor Kafka conectado com sucesso');
    } catch (error) {
      console.warn('⚠️ Kafka não disponível, operando em modo fallback');
      this.isConnected = false;
    }
  }

  private async ensureConnection() {
    if (!this.isConnected && this.producer) {
      try {
        await this.producer.connect();
        this.isConnected = true;
        console.log('✅ Produtor Kafka reconectado');
      } catch (error) {
        console.warn('⚠️ Não foi possível reconectar ao Kafka');
        this.isConnected = false;
      }
    }
  }

  async sendEvent(topic: string, message: any): Promise<void> {
    try {
      await this.ensureConnection();
      
      if (!this.isConnected) {
        console.log(`📝 [FALLBACK] Evento para ${topic}:`, JSON.stringify(message, null, 2));
        return;
      }

      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
      
      console.log(`✅ Evento enviado para ${topic}`);
    } catch (error) {
      console.error(`❌ Erro ao enviar evento para tópico ${topic}:`, error.message);
      this.isConnected = false;
    }
  }

  async sendPedidoCreated(pedido: any): Promise<void> {
    await this.sendEvent('pedidos.created', {
      id: pedido.id,
      cliente_id: pedido.cliente_id,
      tipo_pao_id: pedido.tipo_pao_id,
      quantidade: pedido.quantidade,
      preco_total: pedido.preco_total,
      status: pedido.status,
      data_pedido: pedido.data_pedido,
      timestamp: new Date().toISOString(),
    });
  }

  async sendPedidoUpdated(pedido: any): Promise<void> {
    await this.sendEvent('pedidos.updated', {
      id: pedido.id,
      cliente_id: pedido.cliente_id,
      tipo_pao_id: pedido.tipo_pao_id,
      quantidade: pedido.quantidade,
      preco_total: pedido.preco_total,
      status: pedido.status,
      data_atualizacao: pedido.data_atualizacao,
      timestamp: new Date().toISOString(),
    });
  }

  async sendPedidoStatusChanged(pedidoId: number, oldStatus: StatusPedido, newStatus: StatusPedido): Promise<void> {
    await this.sendEvent('pedidos.status-changed', {
      pedido_id: pedidoId,
      old_status: oldStatus,
      new_status: newStatus,
      timestamp: new Date().toISOString(),
    });
  }

  async sendPedidoCancelled(pedidoId: number): Promise<void> {
    await this.sendEvent('pedidos.cancelled', {
      pedido_id: pedidoId,
      timestamp: new Date().toISOString(),
    });
  }

  async sendClienteCreated(cliente: any): Promise<void> {
    await this.sendEvent('clientes.created', {
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      endereco: cliente.endereco,
      data_criacao: cliente.data_criacao,
      timestamp: new Date().toISOString(),
    });
  }

  async sendClienteUpdated(cliente: any): Promise<void> {
    await this.sendEvent('clientes.updated', {
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      endereco: cliente.endereco,
      data_atualizacao: cliente.data_atualizacao,
      timestamp: new Date().toISOString(),
    });
  }

  async sendClienteDeleted(clienteId: number): Promise<void> {
    await this.sendEvent('clientes.deleted', {
      cliente_id: clienteId,
      timestamp: new Date().toISOString(),
    });
  }

  async sendTipoPaoCreated(tipoPao: any): Promise<void> {
    await this.sendEvent('tipos-pao.created', {
      id: tipoPao.id,
      nome: tipoPao.nome,
      descricao: tipoPao.descricao,
      preco_base: tipoPao.preco_base,
      ativo: tipoPao.ativo,
      data_criacao: tipoPao.data_criacao,
      timestamp: new Date().toISOString(),
    });
  }

  async sendTipoPaoUpdated(tipoPao: any): Promise<void> {
    await this.sendEvent('tipos-pao.updated', {
      id: tipoPao.id,
      nome: tipoPao.nome,
      descricao: tipoPao.descricao,
      preco_base: tipoPao.preco_base,
      ativo: tipoPao.ativo,
      data_atualizacao: tipoPao.data_atualizacao,
      timestamp: new Date().toISOString(),
    });
  }

  async sendTipoPaoDeleted(tipoPaoId: number): Promise<void> {
    await this.sendEvent('tipos-pao.deleted', {
      tipo_pao_id: tipoPaoId,
      timestamp: new Date().toISOString(),
    });
  }

  async disconnect(): Promise<void> {
    if (this.producer && this.isConnected) {
      try {
        await this.producer.disconnect();
        console.log('✅ Produtor Kafka desconectado');
      } catch (error) {
        console.error('❌ Erro ao desconectar produtor Kafka:', error);
      }
    }
  }
} 