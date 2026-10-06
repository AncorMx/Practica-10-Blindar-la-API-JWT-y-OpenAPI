import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DominioExceptionFilter } from './comun/filtros/dominio.filter';
import { LoggingInterceptor } from './comun/interceptores/logging.interceptor';
import { SobreInterceptor } from './comun/interceptores/sobre.interceptor';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Habilitar CORS para los dos orígenes de desarrollo
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // el puerto de Vite (React, Unidad III)
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

  // 3. Registrar el filtro global de excepciones para dominio y los interceptores
  app.useGlobalFilters(new DominioExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new SobreInterceptor());

  // 4. Guardia global por omisión
  const reflector = app.get(Reflector); // el guard lo usa para leer @Publico()
  app.useGlobalGuards(new JwtAuthGuard(reflector)); // TODAS las rutas piden token
  app.useGlobalGuards(new RolesGuard(reflector)); // verifica roles si están presentes

  // 5. Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('API del Gimnasio') // titulo que sale arriba de /docs
    .setVersion('1.0')
    .addBearerAuth() // agrega el boton Authorize
    .addSecurityRequirements('bearer') // pone el candado en todas las rutas
    .build();
  const documento = SwaggerModule.createDocument(app, config); // recorre controllers y DTO
  SwaggerModule.setup('docs', app, documento); // lo publica en /docs

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
