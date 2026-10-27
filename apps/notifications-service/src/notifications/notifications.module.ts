import { Module } from '@nestjs/common';

import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';
import { MailModule } from '../mail/mail.module.js';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module.js';
import { UsersClientService } from '../users-client/users-client.service.js';
import { NotificationsRepository } from './notifications.repository.js';

@Module({
  imports: [MailModule, RabbitmqModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    UsersClientService,
    NotificationsRepository,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
