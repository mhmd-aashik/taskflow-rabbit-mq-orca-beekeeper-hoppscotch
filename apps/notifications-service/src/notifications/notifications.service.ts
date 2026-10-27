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

    // 1. Atomically claim the notification
    const claimed = await this.claimNotification(event.taskId);

    // 2. Handle duplicate or currently processing notification
    if (!claimed) {
      const existing = await this.notificationsRepository.findByTaskId(
        event.taskId,
      );

      if (existing?.status === 'SENT') {
        this.logger.log(
          `Notification already sent for task ${event.taskId}. Skipping.`,
        );
        return;
      }

      throw new Error(
        `Notification is currently being processed: ${event.taskId}`,
      );
    }

    // 3. Use the token returned by the atomic claim
    const processingToken = claimed.processingToken;

    if (!processingToken) {
      throw new Error(`Processing token missing for task ${event.taskId}`);
    }

    try {
      // 4. Fetch the task creator
      const user = await this.usersClientService.findById(event.createdBy);

      if (!user) {
        throw new Error(`User not found: ${event.createdBy}`);
      }

      // 5. Send notification email
      await this.mailService.sendTaskCreatedEmail(user.email, event.title);

      // 6. Mark notification as SENT only if we still own it
      const markedSent = await this.notificationsRepository.markSent(
        event.taskId,
        processingToken,
      );
      
      if (!markedSent) {
        throw new Error(`Unable to mark notification as SENT`);
      }

      this.logger.log(
        `Notification sent to ${user.email} for task ${event.taskId}`,
      );
    } catch (error) {
      // 7. Mark failure using the same processing token
      try {
        const markedFailed = await this.notificationsRepository.markFailed(
          event.taskId,
          processingToken,
        );

        if (!markedFailed) {
          this.logger.warn(
            `Could not mark notification FAILED; ownership may have changed: ${event.taskId}`,
          );
        }
      } catch (databaseError) {
        this.logger.error(
          `Failed to record notification failure: ${event.taskId}`,
          databaseError instanceof Error
            ? databaseError.stack
            : String(databaseError),
        );
      }

      // 8. Rethrow so RabbitMQ can retry or send to DLQ
      throw error;
    }
  }

  private async claimNotification(taskId: string) {
    // First delivery: insert a new processing record
    const created = await this.notificationsRepository.createProcessing(taskId);

    if (created) {
      return created;
    }

    const existing = await this.notificationsRepository.findByTaskId(taskId);

    // Already delivered: do not send another email
    if (existing?.status === 'SENT') {
      return null;
    }

    // Previous attempt failed: reclaim atomically
    if (existing?.status === 'FAILED') {
      return this.notificationsRepository.claimFailed(taskId);
    }

    // Recover abandoned processing attempts
    if (existing?.status === 'PROCESSING') {
      return this.notificationsRepository.claimStaleProcessing(taskId);
    }

    return null;
  }
}
