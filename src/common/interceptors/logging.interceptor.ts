import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const now = Date.now();

    console.log(`📥 ${method} ${url} - Iniciando requisição`);

    return next.handle().pipe(
      tap((data) => {
        const responseTime = Date.now() - now;
        console.log(`📤 ${method} ${url} - ${responseTime}ms - Sucesso`);
      }),
    );
  }
} 