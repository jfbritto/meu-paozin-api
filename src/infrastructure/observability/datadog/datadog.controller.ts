import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DatadogService } from './datadog.service';

@ApiTags('Observability')
@Controller('observability')
export class DatadogController {
  private readonly logger = new Logger(DatadogController.name);

  constructor(private readonly datadogService: DatadogService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check do Datadog' })
  @ApiResponse({
    status: 200,
    description: 'Status do Datadog',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        datadog: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            service: { type: 'string' },
            env: { type: 'string' },
            version: { type: 'string' },
          },
        },
        timestamp: { type: 'string' },
      },
    },
  })
  getHealth() {
    const config = this.datadogService.getConfig();
    const isReady = this.datadogService.isReady();

    return {
      status: isReady ? 'healthy' : 'unhealthy',
      datadog: {
        enabled: config.enabled,
        service: config.service,
        env: config.env,
        version: config.version,
        ready: isReady,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Métricas do Datadog' })
  @ApiResponse({
    status: 200,
    description: 'Métricas disponíveis',
  })
  getMetrics() {
    // Enviar métrica de teste
    this.datadogService.sendMetric('health.check', 1, {
      endpoint: '/observability/metrics',
    });

    return {
      message: 'Métrica enviada com sucesso',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('events')
  @ApiOperation({ summary: 'Eventos do Datadog' })
  @ApiResponse({
    status: 200,
    description: 'Evento enviado',
  })
  getEvents() {
    // Enviar evento de teste
    this.datadogService.sendEvent('health.check.event', {
      endpoint: '/observability/events',
      timestamp: new Date().toISOString(),
    });

    return {
      message: 'Evento enviado com sucesso',
      timestamp: new Date().toISOString(),
    };
  }
} 