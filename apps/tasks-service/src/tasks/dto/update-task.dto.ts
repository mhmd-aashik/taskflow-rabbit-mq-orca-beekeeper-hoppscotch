import { PartialType, OmitType } from '@nestjs/mapped-types';

import { IsEnum, IsOptional } from 'class-validator';
import { CreateTaskDto } from './create-task.dto.js';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export class UpdateTaskDto extends PartialType(
  OmitType(CreateTaskDto, ['createdBy'] as const),
) {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
