import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface TaskCreatedEvent {
  taskId: string;
  title: string;
  createdBy: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  occurredAt: string;
}

@Injectable()
export class TaskEventsService {
  private readonly logger = new Logger(TaskEventsService.name);

  constructor(
    @Inject('TASK_EVENTS')
    private readonly client: ClientProxy,
  ) {}

  async emitTaskCreated(event: TaskCreatedEvent): Promise<void> {
    await firstValueFrom(this.client.emit('task.created', event));

    this.logger.log(`Published task.created for ${event.taskId}`);
  }
}
