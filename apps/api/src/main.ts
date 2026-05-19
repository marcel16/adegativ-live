import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.enableCors({
    origin: [
      process.env.APP_URL || 'http://localhost:8080',
      'https://adega.queroservico.store',
      'https://admin.adega.queroservico.com.br',
      'https://tv.adega.queroservico.com.br',
      'https://api.adega.queroservico.com.br',
    ].filter(Boolean),
    credentials: true,
  });
  app.use(helmet.default({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`AdegaTV Live API running on port ${port}`);
}
bootstrap();
