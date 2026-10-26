import { Injectable, NotFoundException } from '@nestjs/common';

import { TasksRepository } from './tasks.repository.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UsersClientService } from '../users-client/users-client.service.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskEventsService } from '../rabbitmq/task-events.service.js';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly usersClient: UsersClientService,
    private readonly taskEventsService: TaskEventsService,
  ) {}

  async create(dto: CreateTaskDto) {
    await this.usersClient.validateUser(dto.createdBy);

    const task = await this.tasksRepository.create({
      title: dto.title,
      description: dto.description,
      createdBy: dto.createdBy,
    });

    await this.taskEventsService.emitTaskCreated({
      taskId: task.id,
      title: task.title,
      createdBy: task.createdBy,
      status: task.status,
      occurredAt: task.createdAt.toISOString(),
    });

    return task;
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
