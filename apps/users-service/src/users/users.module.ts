import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { UsersRepository } from './users.repository.js';
import { DatabaseModule } from '../database/database.module.ts.js';
import { UsersRmqController } from './users-rmq.controller.js';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController, UsersRmqController],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}
