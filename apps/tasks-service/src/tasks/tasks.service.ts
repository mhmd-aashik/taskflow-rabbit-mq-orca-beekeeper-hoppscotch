import { Injectable, NotFoundException } from '@nestjs/common';

import { TasksRepository } from './tasks.repository.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UsersClientService } from '../users-client/users-client.service.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

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

  async findAll() {
    return this.tasksRepository.findAll();
  }

  async findById(id: string) {
    const task = await this.tasksRepository.findById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async findByUserId(userId: string) {
    return this.tasksRepository.findByUserId(userId);
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.tasksRepository.update(id, dto);

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async delete(id: string) {
    const task = await this.tasksRepository.delete(id);

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }
}
