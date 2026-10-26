import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

export const USERS_RMQ_CLIENT = 'USERS_RMQ_CLIENT';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: USERS_RMQ_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ??
              'amqp://taskflow:taskflow_dev@localhost:5672',
          ],
          queue: process.env.RABBITMQ_USERS_QUEUE ?? 'taskflow.users.rpc',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitmqModule {}
