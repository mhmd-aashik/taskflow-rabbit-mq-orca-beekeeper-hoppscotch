
import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service.js';

interface TaskCreatedEvent {
  taskId: string;
  title: string;
  createdBy: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  occurredAt: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly mailService: MailService,
  ) {}

  async handleTaskCreated(
    event: TaskCreatedEvent,
  ): Promise<void> {
    this.logger.log(
      `Processing task.created: ${event.taskId}`,
    );

    const recipient =
      process.env.NOTIFICATION_TEST_EMAIL ??
      'developer@example.com';

    await this.mailService.sendTaskCreatedEmail(
      recipient,
      event.title,
    );

    this.logger.log(
      `Notification processed for task: ${event.taskId}`,
    );
  }
}
