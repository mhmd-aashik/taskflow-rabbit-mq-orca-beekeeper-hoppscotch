import { Module } from '@nestjs/common';

import { RabbitmqModule } from '../../../rabbitmq/rabbitmq.module.js';
import { UsersClientService } from '../users-client/users-client.service.js';

import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule, RabbitmqModule],
  controllers: [],
  providers: [UsersClientService],
})
export class TasksModule {}
