import { Injectable, Logger } from '@nestjs/common';

export interface TaskCreatedEvent {
  taskId: string;
  title: string;
  createdBy: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  occurredAt: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async handleTaskCreated(event: TaskCreatedEvent): Promise<void> {
    this.logger.log('New task notification received');

    this.logger.log(`Task ID: ${event.taskId}`);
    this.logger.log(`Title: ${event.title}`);
    this.logger.log(`Created By: ${event.createdBy}`);
    this.logger.log(`Status: ${event.status}`);
    this.logger.log(`Occurred At: ${event.occurredAt}`);
  }
}
