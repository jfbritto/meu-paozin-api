import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { DatadogInterceptor } from './infrastructure/observability/datadog/datadog.interceptor';
import { DatadogDecoratorInterceptor } from './infrastructure/observability/datadog/datadog-decorator.interceptor';
import { DatadogMiddleware } from './infrastructure/observability/datadog/datadog.middleware';
import { DatadogService } from './infrastructure/observability/datadog/datadog.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Obter instância do DatadogService
  const datadogService = app.get(DatadogService);

  // Configuração global de validação
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove propriedades não decoradas
    forbidNonWhitelisted: true, // Rejeita requisições com propriedades não permitidas
    transform: true, // Transforma automaticamente tipos
  }));

  // Filtro global de exceções
  app.useGlobalFilters(new HttpExceptionFilter());

  // Interceptor global de logging
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Interceptors do Datadog
  app.useGlobalInterceptors(
    new DatadogInterceptor(datadogService),
    new DatadogDecoratorInterceptor(datadogService, app.get('Reflector')),
  );

  // Middleware do Datadog
  app.use(new DatadogMiddleware(datadogService).use.bind(new DatadogMiddleware(datadogService)));

  // Configuração de CORS
  app.enableCors();

  // Prefixo global da API
  app.setGlobalPrefix('api');

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('MeuPaoZin API')
    .setDescription('API para gerenciamento de pedidos de pães')
    .setVersion('1.0')
    .addTag('pedidos', 'Operações relacionadas aos pedidos')
    .addTag('observability', 'Endpoints de observabilidade')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 MeuPaoZin rodando na porta ${process.env.PORT ?? 3000}`);
  console.log(`📚 Documentação disponível em: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
  console.log(`🔍 Observabilidade disponível em: http://localhost:${process.env.PORT ?? 3000}/api/observability/health`);
}
bootstrap();
