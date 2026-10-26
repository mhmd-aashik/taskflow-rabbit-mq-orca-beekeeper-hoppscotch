import { NestFactory } from '@nestjs/core';
import { UsersServiceModule } from './users-service.module.js';

async function bootstrap() {
  const app = await NestFactory.create(UsersServiceModule);
  await app.listen(process.env.port ?? 3000);
}
await bootstrap();
