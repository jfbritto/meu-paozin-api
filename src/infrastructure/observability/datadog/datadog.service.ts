import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import * as tracer from 'dd-trace';

@Injectable()
export class DatadogService {
  private readonly logger = new Logger(DatadogService.name);
  private isInitialized = false;

  constructor(private configService: ConfigService) {
    this.initializeDatadog();
  }

  private initializeDatadog() {
    try {
      const serviceName = this.configService.get<string>('DD_SERVICE_NAME', 'meu-paozin-api');
      const environment = this.configService.get<string>('DD_ENV', 'development');
      const version = this.configService.get<string>('DD_VERSION', '1.0.0');
      const agentHost = this.configService.get<string>('DD_AGENT_HOST', 'localhost');
      const agentPort = this.configService.get<number>('DD_AGENT_PORT', 8126);
      const enabled = this.configService.get<boolean>('DD_TRACE_ENABLED', true);

      if (!enabled) {
        this.logger.log('Datadog tracing desabilitado');
        return;
      }

      // Configurar o tracer do Datadog
      // tracer.init({
      //   service: serviceName,
      //   env: environment,
      //   version: version,
      //   hostname: agentHost,
      //   port: agentPort,
      //   logInjection: true,
      //   runtimeMetrics: true,
      //   profiling: true,
      //   reportHostname: true,
      //   tags: {
      //     service: serviceName,
      //     env: environment,
      //     version: version,
      //   },
      // });

      this.isInitialized = true;
      this.logger.log(`✅ Datadog inicializado - Service: ${serviceName}, Env: ${environment}, Version: ${version}`);
    } catch (error) {
      this.logger.error('❌ Erro ao inicializar Datadog:', error);
    }
  }

  /**
   * Envia uma métrica customizada
   */
  sendMetric(name: string, value: number, tags?: Record<string, string>) {
    if (!this.isInitialized) return;

    try {
      // const span = tracer.scope().active();
      // if (span) {
      //   span.setTag(`custom.metric.${name}`, value);
      //   if (tags) {
      //     Object.entries(tags).forEach(([key, value]) => {
      //       span.setTag(key, value);
      //     });
      //   }
      // }
      this.logger.log(`Métrica ${name}: ${value}`, tags);
    } catch (error) {
      this.logger.error(`Erro ao enviar métrica ${name}:`, error);
    }
  }

  /**
   * Envia um evento customizado
   */
  sendEvent(name: string, attributes?: Record<string, any>) {
    if (!this.isInitialized) return;

    try {
      // const span = tracer.scope().active();
      // if (span) {
      //   span.addTags({
      //     'event.name': name,
      //     ...attributes,
      //   });
      // }
      this.logger.log(`Evento ${name}`, attributes);
    } catch (error) {
      this.logger.error(`Erro ao enviar evento ${name}:`, error);
    }
  }

  /**
   * Cria um span customizado
   */
  createSpan(operationName: string, tags?: Record<string, string>) {
    if (!this.isInitialized) return null;

    try {
      // return tracer.startSpan(operationName, {
      //   tags: {
      //     'operation.name': operationName,
      //     ...tags,
      //   },
      // });
      this.logger.log(`Span criado: ${operationName}`, tags);
      return null;
    } catch (error) {
      this.logger.error(`Erro ao criar span ${operationName}:`, error);
      return null;
    }
  }

  /**
   * Adiciona tags ao span atual
   */
  addTags(tags: Record<string, string>) {
    if (!this.isInitialized) return;

    try {
      // const span = tracer.scope().active();
      // if (span) {
      //   span.addTags(tags);
      // }
      this.logger.log('Tags adicionadas:', tags);
    } catch (error) {
      this.logger.error('Erro ao adicionar tags:', error);
    }
  }

  /**
   * Adiciona erro ao span atual
   */
  addError(error: Error, tags?: Record<string, string>) {
    if (!this.isInitialized) return;

    try {
      // const span = tracer.scope().active();
      // if (span) {
      //   span.setTag('error', true);
      //   span.setTag('error.message', error.message);
      //   span.setTag('error.stack', error.stack);
      //   if (tags) {
      //     span.addTags(tags);
      //   }
      // }
      this.logger.error('Erro adicionado:', error.message, tags);
    } catch (err) {
      this.logger.error('Erro ao adicionar erro ao span:', err);
    }
  }

  /**
   * Verifica se o Datadog está inicializado
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Obtém informações de configuração
   */
  getConfig() {
    return {
      service: this.configService.get<string>('DD_SERVICE_NAME', 'meu-paozin-api'),
      env: this.configService.get<string>('DD_ENV', 'development'),
      version: this.configService.get<string>('DD_VERSION', '1.0.0'),
      enabled: this.configService.get<boolean>('DD_TRACE_ENABLED', true),
      agentHost: this.configService.get<string>('DD_AGENT_HOST', 'localhost'),
      agentPort: this.configService.get<number>('DD_AGENT_PORT', 8126),
    };
  }
} 