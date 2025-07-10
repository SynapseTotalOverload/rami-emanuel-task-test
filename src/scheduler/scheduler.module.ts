import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { TasksModule } from '../tasks/tasks.module';
import { WebhookModule } from '../webhook/webhook.module';
import { Task } from '../tasks/entities/task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TasksModule,
    WebhookModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Task]),
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
