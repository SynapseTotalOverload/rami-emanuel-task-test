import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { RegisterWebhookDto } from './dto/register-webhook.dto';

export interface WebhookPayload {
  taskId: number;
  title: string;
  description?: string;
  dueDate: Date;
  status: string;
  message: string;
  timestamp: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async registerWebhook(
    taskId: number,
    registerWebhookDto: RegisterWebhookDto,
  ): Promise<{ message: string }> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    task.webhookUrl = registerWebhookDto.url;
    task.webhookSent = false;
    await this.taskRepository.save(task);

    this.logger.log(
      `Webhook URL registered for task ${taskId}: ${registerWebhookDto.url}`,
    );

    return {
      message: `Webhook URL successfully registered for task ${taskId}`,
    };
  }

  async sendWebhookNotification(task: Task): Promise<boolean> {
    if (!task.webhookUrl) {
      this.logger.warn(`No webhook URL configured for task ${task.id}`);
      return false;
    }

    const payload: WebhookPayload = {
      taskId: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: task.status || 'unknown',
      message: 'Task due date is approaching (within 1 hour)',
      timestamp: new Date().toISOString(),
    };

    try {
      console.log('task.webhookUrl', task.webhookUrl);
      const response = await fetch(task.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TaskManager-Webhook/1.0',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
      console.log('response', response);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(
        `+ Webhook sent successfully for task ${task.id} to ${task.webhookUrl}`,
      );
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.log(
        `- Failed to send webhook for task ${task.id}: ${errorMessage}`,
      );
      return false;
    }
  }

  async removeWebhook(taskId: number): Promise<{ message: string }> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    task.webhookUrl = undefined;
    task.webhookSent = false;
    await this.taskRepository.save(task);

    this.logger.log(`Webhook URL removed for task ${taskId}`);

    return {
      message: `Webhook URL successfully removed for task ${taskId}`,
    };
  }
}
