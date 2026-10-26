import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
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
        },
      },
      {
        name: 'TASK_EVENTS',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ??
              'amqp://taskflow:taskflow_dev@localhost:5672',
          ],
          queue: 'taskflow.notifications',
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
