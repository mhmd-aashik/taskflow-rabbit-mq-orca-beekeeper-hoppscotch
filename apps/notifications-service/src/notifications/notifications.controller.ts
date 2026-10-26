import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service.js';

interface TaskCreatedEvent {
  taskId: string;
  title: string;
  createdBy: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  occurredAt: string;
}

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern('task.created')
  async handleTaskCreated(
    @Payload() event: TaskCreatedEvent,
    @Ctx() context: unknown,
  ) {
    const rmqContext = context as RmqContext;

    const channel = rmqContext.getChannelRef();
    const message = rmqContext.getMessage();

    try {
      await this.notificationsService.handleTaskCreated(event);

      channel.ack(message);

      this.logger.log(`Acknowledged task.created: ${event.taskId}`);
    } catch (error) {
      this.logger.error(
        `Failed to process task.created: ${event.taskId}`,
        error instanceof Error ? error.stack : String(error),
      );

      channel.nack(message, false, false);
    }
  }
}
