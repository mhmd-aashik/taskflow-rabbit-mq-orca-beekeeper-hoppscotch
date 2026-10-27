import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service.js';
import type { ConsumeMessage } from 'amqplib';

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
    const message = rmqContext.getMessage() as ConsumeMessage;
    const retryCount = Number(
      message.properties.headers?.['x-taskflow-retry-count'] ?? 0,
    );

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

      if (retryCount >= 3) {
        this.logger.warn(
          `Maximum retries reached for task ${event.taskId}. Sending to DLQ.`,
        );

        channel.nack(message, false, false);
        return;
      }

      try {
        await this.publishRetry(channel, message, retryCount);

        channel.ack(message);

        this.logger.warn(
          `Retry ${retryCount + 1}/3 scheduled for task ${event.taskId}`,
        );
      } catch (retryError) {
        this.logger.error(
          `Failed to schedule retry for task ${event.taskId}`,
          retryError instanceof Error ? retryError.stack : String(retryError),
        );

        channel.nack(message, false, true);
      }
    }
  }

  private async publishRetry(
    channel: RmqContext['getChannelRef'] extends (...args: any[]) => infer T
      ? T
      : never,
    message: ConsumeMessage,
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
      ...message.properties,
      persistent: true,
      mandatory: true,
      headers: {
        ...message.properties.headers,
        'x-taskflow-retry-count': retryCount + 1,
      },
    });

    await channel.waitForConfirms();
  }
}
