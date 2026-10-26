import { Module } from '@nestjs/common';
import { UsersServiceController } from './users-service.controller.js';
import { UsersServiceService } from './users-service.service.js';

@Module({
  imports: [],
  controllers: [UsersServiceController],
  providers: [UsersServiceService],
})
export class UsersServiceModule {}
