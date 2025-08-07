import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DatadogService } from './datadog.service';
import * as tracer from 'dd-trace';

@Injectable()
export class DatadogMiddleware implements NestMiddleware {
  private readonly logger = new Logger(DatadogMiddleware.name);

  constructor(private readonly datadogService: DatadogService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Adicionar headers de trace do Datadog
    const span = tracer.scope().active();
    if (span) {
      const traceId = span.context().toTraceId();
      const spanId = span.context().toSpanId();

      res.setHeader('X-Datadog-Trace-ID', traceId);
      res.setHeader('X-Datadog-Span-ID', spanId);
      res.setHeader('X-Datadog-Sampling-Priority', '1');
    }

    // Adicionar request ID se não existir
    if (!req.headers['x-request-id']) {
      req.headers['x-request-id'] = this.generateRequestId();
    }

    // Adicionar headers de resposta
    res.setHeader('X-Request-ID', req.headers['x-request-id']);

    // Log da requisição
    this.logger.log(
      `${req.method} ${req.url} - ${req.ip} - ${req.get('User-Agent')}`,
    );

    next();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 