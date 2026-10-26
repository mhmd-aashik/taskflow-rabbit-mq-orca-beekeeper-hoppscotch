import { NestFactory } from '@nestjs/core';
import { UsersServiceModule } from './users-service.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(UsersServiceModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.USERS_PORT ?? 3001);
}
await bootstrap();
