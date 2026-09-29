import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DominioExcepcionFilter } from './common/filters/dominio-excepcion.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Habilitar CORS para los dos orígenes de desarrollo
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    exposedHeaders: ['Location', 'X-Request-Id'],
  });

  // 2. Activar la validación global con las 4 opciones
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 3. Registrar el filtro global de excepciones para dominio
  app.useGlobalFilters(new DominioExcepcionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
