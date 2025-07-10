import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { TaskStatus } from '../dto/create-task.dto';

@Entity('tasks')
export class Task {
  @ApiProperty({
    description: 'Unique task identifier',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Task title',
    example: 'Complete homework',
  })
  @Column()
  title: string;

  @ApiProperty({
    description: 'Task description',
    example: 'Complete math exercises on pages 25-30',
    nullable: true,
  })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Task due date in ISO-8601 format',
    example: '2024-01-15T10:30:00.000Z',
    nullable: true,
    format: 'date-time',
  })
  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @ApiProperty({
    description: 'Task status',
    example: TaskStatus.OPEN,
    enum: TaskStatus,
  })
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.OPEN,
  })
  status?: TaskStatus;

  @ApiProperty({
    description: 'Task creation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Task update date',
    example: '2024-01-15T12:45:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Task deletion date (soft delete) - when null, task is active',
    example: null,
    nullable: true,
  })
  @Exclude()
  @DeleteDateColumn()
  deletedAt?: Date;

  @ApiProperty({
    description: 'Webhook URL for due date notifications',
    example: 'https://webhook.site/123e4567-e89b-12d3-a456-426614174000',
  })
  @Exclude()
  @Column({ nullable: true })
  webhookUrl?: string;

  @Exclude()
  @Column({ default: false })
  webhookSent?: boolean;
}
