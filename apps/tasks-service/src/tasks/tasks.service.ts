import { Injectable } from '@nestjs/common';

import { TasksRepository } from './tasks.repository.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UsersClientService } from '../users-client/users-client.service.js';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly usersClient: UsersClientService,
  ) {}

  async create(dto: CreateTaskDto) {
    await this.usersClient.validateUser(dto.createdBy);

    return this.tasksRepository.create({
      title: dto.title,
      description: dto.description,
      createdBy: dto.createdBy,
    });
  }
}
