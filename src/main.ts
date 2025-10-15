import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { setupSwagger } from './docs/swagger';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // ✅ Must come BEFORE global prefix and before static assets
  app.enableCors({
    origin: 'http://localhost:5173', // ← single origin, not wildcard
    credentials: true,               // ← allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  setupSwagger(app);

  // Redirect root to docs
  // app.getHttpAdapter().get('/', (req, res) => res.redirect('/docs'));

  const port = process.env.PORT || 3000;

  // Serve static client if you build it later
  app.use(express.static(join(__dirname, '..', 'client')));

  await app.listen(port);
  console.log(`Listening on http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/docs`);
}

bootstrap();
