import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service.js';
import { Buffer } from 'node:buffer';

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

    this.logger.log(
      `Publisher confirms available: ${typeof channel.waitForConfirms === 'function'}`,
    );

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

  private async publishRetry(
    channel: RmqContext['getChannelRef'] extends (...args: any[]) => infer T
      ? T
      : never,
    message: {
      content: Buffer;
      properties: { headers?: Record<string, unknown> };
    },
    retryCount: number,
  ): Promise<void> {
    const retryQueues = [
      'taskflow.notifications.retry.5s',
      'taskflow.notifications.retry.15s',
      'taskflow.notifications.retry.30s',
    ];

    const queue = retryQueues[retryCount];

    if (!queue) {
      throw new Error('Maximum retry attempts exceeded');
    }

    channel.sendToQueue(queue, message.content, {
      persistent: true,
      headers: {
        ...message.properties.headers,
        'x-taskflow-retry-count': retryCount + 1,
      },
    });

    await channel.waitForConfirms();
  }
}
