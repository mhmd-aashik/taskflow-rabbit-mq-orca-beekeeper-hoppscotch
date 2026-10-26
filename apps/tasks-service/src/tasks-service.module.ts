import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module.js';
import { DatabaseModule } from './database/database.module.js';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TasksModule,
  ],
})
export class TasksServiceModule {}
