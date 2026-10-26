import { Module } from '@nestjs/common';

import { RabbitmqModule } from '../../../rabbitmq/rabbitmq.module.js';
import { UsersClientService } from '../users-client/users-client.service.js';

import { DatabaseModule } from '../database/database.module.js';
import { TasksController } from './tasks.controller.js';
import { TasksRepository } from './tasks.repository.js';
import { TasksService } from './tasks.service.js';

@Module({
  imports: [DatabaseModule, RabbitmqModule],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository, UsersClientService],
})
export class TasksModule {}
