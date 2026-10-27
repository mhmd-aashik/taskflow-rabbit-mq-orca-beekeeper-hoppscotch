import { NestFactory } from '@nestjs/core';
import { NotificationsServiceModule } from './notifications-service.module.js';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationsServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [
          process.env.RABBITMQ_URL ??
            'amqp://taskflow:taskflow_dev@localhost:5672',
        ],
        queue: 'taskflow.notifications',
        queueOptions: {
          durable: true,
          arguments: {
            'x-dead-letter-exchange': 'taskflow.notifications.dlx',
            'x-dead-letter-routing-key': 'taskflow.notifications.failed',
          },
        },

        noAck: false,
        prefetchCount: 10,
      },
    },
  );

  app.enableShutdownHooks();

  await app.listen();
}
await bootstrap();
