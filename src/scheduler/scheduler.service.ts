import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task.entity';
import { Repository, Between } from 'typeorm';
import { WebhookService } from '../webhook/webhook.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly webhookService: WebhookService,
  ) {}

  @Cron('0 */1 * * * *')
  async checkUpcomingTasks() {
    this.logger.log('⏰ Checking for upcoming tasks...');

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    try {
      const upcomingTasks = await this.taskRepository.find({
        where: {
          dueDate: Between(now, oneHourFromNow),
          webhookSent: false,
        },
      });

      for (const task of upcomingTasks) {
        if (!task.webhookUrl) {
          this.logger.warn(`Task ${task.id} has no webhook URL configured`);
          continue;
        }

        try {
          const success =
            await this.webhookService.sendWebhookNotification(task);

          if (success) {
            // Mark webhook as sent
            task.webhookSent = true;
            await this.taskRepository.save(task);
            console.log(
              `+ Webhook notification sent for task ${task.id}: "${task.title}"`,
            );
          } else {
            console.log(
              `-  Failed to send webhook for task ${task.id}: "${task.title}"`,
            );
          }
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          console.log(
            `- Error processing webhook for task ${task.id}: ${errorMessage}`,
          );
        }
      }

      if (upcomingTasks.length === 0) {
        console.log('No upcoming tasks requiring notifications');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.log(`- Error checking upcoming tasks: ${errorMessage}`);
    }
  }
}
