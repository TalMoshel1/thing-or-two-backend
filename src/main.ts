import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { setupSwagger } from './docs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  // enable cookie parser so we can read/write cookies (for JWT in cookie)
  app.use(cookieParser());

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

  app.getHttpAdapter().get('/', (req, res) => {
    res.redirect('/docs');
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Listening on http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/docs`);
}

bootstrap();
