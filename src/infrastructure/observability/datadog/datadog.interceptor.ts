import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { DatadogService } from './datadog.service';
// import * as tracer from 'dd-trace';

@Injectable()
export class DatadogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DatadogInterceptor.name);

  constructor(private readonly datadogService: DatadogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const method = request.method;
    const url = request.url;
    const userAgent = request.get('User-Agent');
    const startTime = Date.now();

    // Criar span para a requisição HTTP
    const span = this.datadogService.createSpan('http.request', {
      'http.method': method,
      'http.url': url,
      'http.user_agent': userAgent,
      'http.request_id': request.headers['x-request-id'] || this.generateRequestId(),
    });

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Adicionar métricas de sucesso
        this.datadogService.sendMetric('http.request.duration', duration, {
          method,
          status_code: statusCode.toString(),
          endpoint: url,
        });

        this.datadogService.sendMetric('http.request.count', 1, {
          method,
          status_code: statusCode.toString(),
          endpoint: url,
        });

        // Adicionar tags ao span
        // if (span) {
        //   span.setTag('http.status_code', statusCode);
        //   // Verificar se data existe antes de acessar length
        //   const responseSize = data ? JSON.stringify(data).length : 0;
        //   span.setTag('http.response_size', responseSize);
        //   span.setTag('http.duration_ms', duration);
        //   span.finish();
        // }

        this.logger.log(
          `${method} ${url} - ${statusCode} - ${duration}ms`,
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;

        // Adicionar métricas de erro
        this.datadogService.sendMetric('http.request.error', 1, {
          method,
          status_code: statusCode.toString(),
          endpoint: url,
          error_type: error.constructor.name,
        });

        this.datadogService.sendMetric('http.request.duration', duration, {
          method,
          status_code: statusCode.toString(),
          endpoint: url,
        });

        // Adicionar erro ao span
        this.datadogService.addError(error, {
          method,
          status_code: statusCode.toString(),
          endpoint: url,
        });

        // if (span) {
        //   span.setTag('http.status_code', statusCode);
        //   span.setTag('http.duration_ms', duration);
        //   span.finish();
        // }

        this.logger.error(
          `${method} ${url} - ${statusCode} - ${duration}ms - ${error.message}`,
        );

        throw error;
      }),
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 