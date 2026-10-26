import { NestFactory } from '@nestjs/core';
import { UsersServiceModule } from './users-service.module.js';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [
          process.env.RABBITMQ_URL ??
            'amqp://taskflow:taskflow_dev@localhost:5672',
        ],
        queue: 'taskflow.users.rpc',
        queueOptions: {
          durable: true,
        },
        noAck: true,
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen();
}
await bootstrap();
