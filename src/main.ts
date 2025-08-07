import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MoneyFormatPipe } from './common/pipes/money-format.pipe';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
// import { DatadogInterceptor } from './infrastructure/observability/datadog/datadog.interceptor';
// import { DatadogDecoratorInterceptor } from './infrastructure/observability/datadog/datadog-decorator.interceptor';
// import { DatadogMiddleware } from './infrastructure/observability/datadog/datadog.middleware';
// import { DatadogService } from './infrastructure/observability/datadog/datadog.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Obter instância do DatadogService
  // const datadogService = app.get(DatadogService);

  // Configuração global de validação
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
    new MoneyFormatPipe(),
  );

  // Filtro global de exceções
  app.useGlobalFilters(new HttpExceptionFilter());

  // Interceptor global de logging
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Interceptors do Datadog
  // app.useGlobalInterceptors(
  //   new DatadogInterceptor(datadogService),
  //   new DatadogDecoratorInterceptor(datadogService, app.get('Reflector')),
  // );

  // Middleware do Datadog
  // app.use(new DatadogMiddleware(datadogService).use.bind(new DatadogMiddleware(datadogService)));

  // Configuração de CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Prefixo global da API
  app.setGlobalPrefix('api');

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('MeuPaoZin API')
    .setDescription('API para gerenciamento de pedidos de pães')
    .setVersion('1.0')
    .addTag('pedidos', 'Operações relacionadas aos pedidos')
    // .addTag('observability', 'Endpoints de observabilidade')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Configuração da porta
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 MeuPaoZin rodando na porta ${process.env.PORT ?? 3000}`);
  console.log(`📚 Documentação disponível em: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
  // console.log(`🔍 Observabilidade disponível em: http://localhost:${process.env.PORT ?? 3000}/api/observability/health`);
}
bootstrap();
