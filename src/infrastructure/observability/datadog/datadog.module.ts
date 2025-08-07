import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatadogService } from './datadog.service';
import { DatadogInterceptor } from './datadog.interceptor';
import { DatadogMiddleware } from './datadog.middleware';
import { DatadogDecoratorInterceptor } from './datadog-decorator.interceptor';
import { DatadogController } from './datadog.controller';

@Module({
  imports: [ConfigModule],
  controllers: [DatadogController],
  providers: [
    DatadogService,
    DatadogInterceptor,
    DatadogMiddleware,
    DatadogDecoratorInterceptor,
  ],
  exports: [
    DatadogService,
    DatadogInterceptor,
    DatadogMiddleware,
    DatadogDecoratorInterceptor,
  ],
})
export class DatadogModule {} 