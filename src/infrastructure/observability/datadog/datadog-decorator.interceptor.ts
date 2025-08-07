import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { DatadogService } from './datadog.service';
import {
  DATADOG_METRICS_KEY,
  DATADOG_EVENTS_KEY,
  DatadogMetric,
  DatadogEvent,
} from './datadog.decorator';

@Injectable()
export class DatadogDecoratorInterceptor implements NestInterceptor {
  constructor(
    private readonly datadogService: DatadogService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const metrics = this.reflector.get<DatadogMetric[]>(
      DATADOG_METRICS_KEY,
      handler,
    );
    const events = this.reflector.get<DatadogEvent[]>(
      DATADOG_EVENTS_KEY,
      handler,
    );
    const trace = this.reflector.get('datadog_trace', handler);

    return next.handle().pipe(
      tap((data) => {
        // Enviar métricas
        if (metrics) {
          metrics.forEach((metric) => {
            this.datadogService.sendMetric(metric.name, metric.value, metric.tags);
          });
        }

        // Enviar eventos
        if (events) {
          events.forEach((event) => {
            this.datadogService.sendEvent(event.name, event.attributes);
          });
        }

        // Criar span customizado
        if (trace) {
          const span = this.datadogService.createSpan(
            trace.operationName,
            trace.tags,
          );
          // if (span) {
          //   span.finish();
          // }
        }
      }),
    );
  }
} 