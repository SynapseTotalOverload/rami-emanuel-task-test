import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TaskStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Complete homework',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Complete math exercises on pages 25-30',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Task due date in ISO-8601 format',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({
    description: 'Task status',
    example: TaskStatus.OPEN,
    enum: TaskStatus,
    default: TaskStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus = TaskStatus.OPEN;
}
