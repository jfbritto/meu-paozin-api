import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { KafkaService } from './kafka.service';

export interface KafkaMessageHandler {
  topic: string;
  handler: (message: any) => Promise<void>;
}

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private handlers: KafkaMessageHandler[] = [];
  private isRunning = false;

  constructor(private kafkaService: KafkaService) {}

  async onModuleInit() {
    // Registra handlers padrão
    this.registerDefaultHandlers();
    
    // Inicia o consumidor
    await this.startConsumer();
  }

  async onModuleDestroy() {
    this.isRunning = false;
    try {
      const consumer = this.kafkaService.getConsumer();
      await consumer.disconnect();
    } catch (error) {
      console.error('❌ Erro ao desconectar consumidor:', error);
    }
  }

  private registerDefaultHandlers() {
    // ===== HANDLERS DE PEDIDOS =====
    
    // Handler para eventos de pedidos criados
    this.registerHandler({
      topic: 'pedidos.created',
      handler: async (message) => {
        console.log('📋 Novo pedido criado:', message);
        await this.handlePedidoCreated(message);
      },
    });

    // Handler para mudanças de status
    this.registerHandler({
      topic: 'pedidos.status-changed',
      handler: async (message) => {
        console.log('🔄 Status do pedido alterado:', message);
        await this.handlePedidoStatusChanged(message);
      },
    });

    // Handler para pedidos atualizados
    this.registerHandler({
      topic: 'pedidos.updated',
      handler: async (message) => {
        console.log('📝 Pedido atualizado:', message);
        await this.handlePedidoUpdated(message);
      },
    });

    // Handler para pedidos cancelados
    this.registerHandler({
      topic: 'pedidos.cancelled',
      handler: async (message) => {
        console.log('❌ Pedido cancelado:', message);
        await this.handlePedidoCancelled(message);
      },
    });

    // ===== HANDLERS DE CLIENTES =====
    
    // Handler para novos clientes
    this.registerHandler({
      topic: 'clientes.created',
      handler: async (message) => {
        console.log('👤 Novo cliente cadastrado:', message);
        await this.handleClienteCreated(message);
      },
    });

    // Handler para clientes atualizados
    this.registerHandler({
      topic: 'clientes.updated',
      handler: async (message) => {
        console.log('👤 Cliente atualizado:', message);
        await this.handleClienteUpdated(message);
      },
    });

    // Handler para clientes deletados
    this.registerHandler({
      topic: 'clientes.deleted',
      handler: async (message) => {
        console.log('👤 Cliente deletado:', message);
        await this.handleClienteDeleted(message);
      },
    });

    // ===== HANDLERS DE TIPOS DE PÃO =====
    
    // Handler para novos tipos de pão
    this.registerHandler({
      topic: 'tipos-pao.created',
      handler: async (message) => {
        console.log('🥖 Novo tipo de pão criado:', message);
        await this.handleTipoPaoCreated(message);
      },
    });

    // Handler para tipos de pão atualizados
    this.registerHandler({
      topic: 'tipos-pao.updated',
      handler: async (message) => {
        console.log('🥖 Tipo de pão atualizado:', message);
        await this.handleTipoPaoUpdated(message);
      },
    });

    // Handler para tipos de pão deletados
    this.registerHandler({
      topic: 'tipos-pao.deleted',
      handler: async (message) => {
        console.log('🥖 Tipo de pão deletado:', message);
        await this.handleTipoPaoDeleted(message);
      },
    });

    // ===== HANDLERS DE ANALYTICS =====
    
    // Handler para eventos de analytics
    this.registerHandler({
      topic: 'analytics.events',
      handler: async (message) => {
        console.log('📊 Evento de analytics:', message);
        await this.handleAnalyticsEvent(message);
      },
    });

    // ===== HANDLERS DE NOTIFICAÇÕES =====
    
    // Handler para notificações
    this.registerHandler({
      topic: 'notifications.events',
      handler: async (message) => {
        console.log('📱 Notificação:', message);
        await this.handleNotificationEvent(message);
      },
    });

    // ===== HANDLERS DE AUDITORIA =====
    
    // Handler para eventos de auditoria
    this.registerHandler({
      topic: 'audit.events',
      handler: async (message) => {
        console.log('🔍 Evento de auditoria:', message);
        await this.handleAuditEvent(message);
      },
    });
  }

  // ===== MÉTODOS DE HANDLING =====

  private async handlePedidoCreated(message: any): Promise<void> {
    try {
      // Enviar notificação para o cliente
      await this.sendNotificationToClient(
        message.clienteId,
        'PEDIDO_CREATED',
        `Seu pedido #${message.pedidoId} foi criado com sucesso!`
      );

      // Atualizar dashboard em tempo real
      await this.updateDashboard({
        type: 'PEDIDO_CREATED',
        data: message
      });

      // Registrar em analytics
      await this.logAnalyticsEvent('PEDIDO_CREATED', message);
    } catch (error) {
      console.error('❌ Erro ao processar pedido criado:', error);
    }
  }

  private async handlePedidoStatusChanged(message: any): Promise<void> {
    try {
      // Enviar notificação para o cliente sobre mudança de status
      const statusMessages = {
        'ACEITO': 'Seu pedido foi aceito e está sendo preparado!',
        'EM_PREPARO': 'Seu pedido está sendo preparado!',
        'SAIU_PARA_ENTREGA': 'Seu pedido saiu para entrega!',
        'FINALIZADO': 'Seu pedido foi entregue!',
        'CANCELADO': 'Seu pedido foi cancelado.'
      };

      const statusMessage = statusMessages[message.newStatus] || 'Status do seu pedido foi atualizado.';
      
      await this.sendNotificationToClient(
        message.clienteId,
        'PEDIDO_STATUS_CHANGED',
        statusMessage
      );

      // Atualizar dashboard
      await this.updateDashboard({
        type: 'PEDIDO_STATUS_CHANGED',
        data: message
      });

      // Registrar em analytics
      await this.logAnalyticsEvent('PEDIDO_STATUS_CHANGED', message);
    } catch (error) {
      console.error('❌ Erro ao processar mudança de status:', error);
    }
  }

  private async handlePedidoUpdated(message: any): Promise<void> {
    try {
      // Atualizar dashboard
      await this.updateDashboard({
        type: 'PEDIDO_UPDATED',
        data: message
      });

      // Registrar em analytics
      await this.logAnalyticsEvent('PEDIDO_UPDATED', message);
    } catch (error) {
      console.error('❌ Erro ao processar pedido atualizado:', error);
    }
  }

  private async handlePedidoCancelled(message: any): Promise<void> {
    try {
      // Enviar notificação de cancelamento
      await this.sendNotificationToClient(
        message.clienteId,
        'PEDIDO_CANCELLED',
        'Seu pedido foi cancelado.'
      );

      // Processar reembolso (se necessário)
      await this.processRefund(message);

      // Atualizar dashboard
      await this.updateDashboard({
        type: 'PEDIDO_CANCELLED',
        data: message
      });

      // Registrar em analytics
      await this.logAnalyticsEvent('PEDIDO_CANCELLED', message);
    } catch (error) {
      console.error('❌ Erro ao processar pedido cancelado:', error);
    }
  }

  private async handleClienteCreated(message: any): Promise<void> {
    try {
      // Enviar email de boas-vindas
      await this.sendWelcomeEmail(message);

      // Cadastrar em sistema de marketing
      await this.registerInMarketingSystem(message);

      // Registrar em analytics
      await this.logAnalyticsEvent('CLIENTE_CREATED', message);
    } catch (error) {
      console.error('❌ Erro ao processar cliente criado:', error);
    }
  }

  private async handleClienteUpdated(message: any): Promise<void> {
    try {
      // Atualizar dados em sistemas externos
      await this.updateExternalSystems(message);

      // Registrar em analytics
      await this.logAnalyticsEvent('CLIENTE_UPDATED', message);
    } catch (error) {
      console.error('❌ Erro ao processar cliente atualizado:', error);
    }
  }

  private async handleClienteDeleted(message: any): Promise<void> {
    try {
      // Processar exclusão em sistemas externos
      await this.processClienteDeletion(message);

      // Registrar em analytics
      await this.logAnalyticsEvent('CLIENTE_DELETED', message);
    } catch (error) {
      console.error('❌ Erro ao processar cliente deletado:', error);
    }
  }

  private async handleTipoPaoCreated(message: any): Promise<void> {
    try {
      // Atualizar catálogo
      await this.updateCatalog(message);

      // Registrar em analytics
      await this.logAnalyticsEvent('TIPO_PAO_CREATED', message);
    } catch (error) {
      console.error('❌ Erro ao processar tipo de pão criado:', error);
    }
  }

  private async handleTipoPaoUpdated(message: any): Promise<void> {
    try {
      // Notificar clientes sobre mudanças de preço
      if (message.previousData?.precoBase !== message.precoBase) {
        await this.notifyPriceChange(message);
      }

      // Atualizar catálogo
      await this.updateCatalog(message);

      // Registrar em analytics
      await this.logAnalyticsEvent('TIPO_PAO_UPDATED', message);
    } catch (error) {
      console.error('❌ Erro ao processar tipo de pão atualizado:', error);
    }
  }

  private async handleTipoPaoDeleted(message: any): Promise<void> {
    try {
      // Atualizar catálogo
      await this.updateCatalog(message);

      // Registrar em analytics
      await this.logAnalyticsEvent('TIPO_PAO_DELETED', message);
    } catch (error) {
      console.error('❌ Erro ao processar tipo de pão deletado:', error);
    }
  }

  private async handleAnalyticsEvent(message: any): Promise<void> {
    try {
      // Processar dados para relatórios
      await this.processAnalyticsData(message);

      // Atualizar dashboards em tempo real
      await this.updateRealTimeDashboards(message);
    } catch (error) {
      console.error('❌ Erro ao processar evento de analytics:', error);
    }
  }

  private async handleNotificationEvent(message: any): Promise<void> {
    try {
      // Enviar notificação via diferentes canais
      await this.sendMultiChannelNotification(message);
    } catch (error) {
      console.error('❌ Erro ao processar notificação:', error);
    }
  }

  private async handleAuditEvent(message: any): Promise<void> {
    try {
      // Registrar em sistema de auditoria
      await this.logAuditEvent(message);
    } catch (error) {
      console.error('❌ Erro ao processar evento de auditoria:', error);
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  registerHandler(handler: KafkaMessageHandler) {
    this.handlers.push(handler);
  }

  private async startConsumer() {
    try {
      const consumer = this.kafkaService.getConsumer();
      
      // Conecta o consumidor
      await consumer.connect();
      console.log('✅ Consumidor Kafka conectado com sucesso');

      // Registra para todos os tópicos dos handlers
      const topics = this.handlers.map(h => h.topic);
      await consumer.subscribe({ topics, fromBeginning: false });

      this.isRunning = true;

      // Inicia o processamento de mensagens
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            if (message.value) {
              const messageValue = JSON.parse(message.value.toString());
              console.log(`📨 Mensagem recebida do tópico ${topic}:`, messageValue);

              // Encontra o handler apropriado
              const handler = this.handlers.find(h => h.topic === topic);
              if (handler) {
                await handler.handler(messageValue);
              }
            }
          } catch (error) {
            console.error(`❌ Erro ao processar mensagem do tópico ${topic}:`, error);
          }
        },
      });

      console.log('🔄 Consumidor Kafka iniciado e processando mensagens');
    } catch (error) {
      console.error('❌ Erro ao iniciar consumidor Kafka:', error);
    }
  }

  // ===== MÉTODOS DE IMPLEMENTAÇÃO =====

  async sendNotificationToClient(clienteId: number, type: string, message: string): Promise<void> {
    console.log(`📱 Notificação para cliente ${clienteId} (${type}): ${message}`);
  }

  async updateDashboard(data: any): Promise<void> {
    console.log('📊 Atualizando dashboard:', data);
  }

  async logAnalyticsEvent(eventType: string, data: any): Promise<void> {
    console.log(`📈 Analytics - ${eventType}:`, data);
  }

  async sendWelcomeEmail(cliente: any): Promise<void> {
    console.log(`📧 Email de boas-vindas enviado para: ${cliente.email}`);
  }

  async registerInMarketingSystem(cliente: any): Promise<void> {
    console.log(`📧 Cliente registrado no sistema de marketing: ${cliente.email}`);
  }

  async updateExternalSystems(cliente: any): Promise<void> {
    console.log(`🔄 Dados do cliente atualizados em sistemas externos: ${cliente.id}`);
  }

  async processClienteDeletion(cliente: any): Promise<void> {
    console.log(`🗑️ Processando exclusão do cliente em sistemas externos: ${cliente.id}`);
  }

  async updateCatalog(tipoPao: any): Promise<void> {
    console.log(`📋 Catálogo atualizado: ${tipoPao.nome}`);
  }

  async notifyPriceChange(tipoPao: any): Promise<void> {
    console.log(`💰 Notificando mudança de preço: ${tipoPao.nome}`);
  }

  async processAnalyticsData(data: any): Promise<void> {
    console.log(`📊 Processando dados de analytics:`, data);
  }

  async updateRealTimeDashboards(data: any): Promise<void> {
    console.log(`📈 Atualizando dashboards em tempo real:`, data);
  }

  async sendMultiChannelNotification(notification: any): Promise<void> {
    console.log(`📱 Enviando notificação multicanal:`, notification);
  }

  async logAuditEvent(audit: any): Promise<void> {
    console.log(`🔍 Registrando evento de auditoria:`, audit);
  }

  async processRefund(pedido: any): Promise<void> {
    console.log(`💳 Processando reembolso para pedido: ${pedido.pedidoId}`);
  }
} 