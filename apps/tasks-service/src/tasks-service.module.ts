import { Module } from '@nestjs/common';
import { TasksServiceController } from './tasks-service.controller.js';
import { TasksServiceService } from './tasks-service.service.js';

@Module({
  imports: [],
  controllers: [TasksServiceController],
  providers: [TasksServiceService],
})
export class TasksServiceModule {}
