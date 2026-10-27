import { Injectable, Logger } from '@nestjs/common';

import { MailService } from '../mail/mail.service.js';
import { UsersClientService } from '../users-client/users-client.service.js';
import { NotificationsRepository } from './notifications.repository.js';

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
    private readonly usersClientService: UsersClientService,
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async handleTaskCreated(event: TaskCreatedEvent): Promise<void> {
    this.logger.log(`Processing task.created: ${event.taskId}`);

    // 1. Fetch task creator from Users Service
    const user = await this.usersClientService.findById(event.createdBy);

    // 2. Skip notification if user does not exist
    if (!user) {
      this.logger.warn(`User not found: ${event.createdBy}`);
      return;
    }

    // 3. Send email to the actual user
    try {
      await this.mailService.sendTaskCreatedEmail(user.email, event.title);
    } catch (error) {
      await this.notificationsRepository.markFailed(event.taskId);
      throw error;
    }

    // 4. Log successful processing
    this.logger.log(
      `Notification sent to ${user.email} for task ${event.taskId}`,
    );
  }

  private async claimNotification(taskId: string): Promise<boolean> {
    const created = await this.notificationsRepository.createProcessing(taskId);

    if (created) {
      return true;
    }

    const existing = await this.notificationsRepository.findByTaskId(taskId);

    if (existing?.status === 'SENT') {
      this.logger.log(`Skipping duplicate notification for task ${taskId}`);

      return false;
    }

    if (existing?.status === 'FAILED') {
      const claimed = await this.notificationsRepository.claimFailed(taskId);

      return claimed !== null;
    }

    return false;
  }
}
