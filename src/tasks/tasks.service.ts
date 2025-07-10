import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto, TaskStatus } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationDto } from './dto/pagination.dto';
import { TaskReportDto } from './dto/task-report.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasNext: boolean;
  hasPrev: boolean;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      // Convert ISO string to Date if dueDate is provided
      dueDate: createTaskDto.dueDate
        ? new Date(createTaskDto.dueDate)
        : undefined,
    });
    return await this.taskRepository.save(task);
  }

  async findAll(paginationDto?: PaginationDto): Promise<PaginatedResult<Task>> {
    const { limit = 10, offset = 0 } = paginationDto || {};

    const [data, total] = await this.taskRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      data,
      total,
      limit,
      offset,
      hasNext: offset + limit < total,
      hasPrev: offset > 0,
    };
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    // Convert ISO string to Date if dueDate is provided in update
    const updateData = {
      ...updateTaskDto,
      dueDate: updateTaskDto.dueDate
        ? new Date(updateTaskDto.dueDate)
        : updateTaskDto.dueDate,
    };

    Object.assign(task, updateData);
    return await this.taskRepository.save(task);
  }

  async remove(id: number): Promise<{ message: string }> {
    const task = await this.findOne(id);
    await this.taskRepository.softRemove(task);
    return { message: 'Task successfully deleted' };
  }

  // Get aggregate report of tasks by status
  async getTaskReport(): Promise<TaskReportDto> {
    const [openCount, inProgressCount, doneCount] = await Promise.all([
      this.taskRepository.count({ where: { status: TaskStatus.OPEN } }),
      this.taskRepository.count({ where: { status: TaskStatus.IN_PROGRESS } }),
      this.taskRepository.count({ where: { status: TaskStatus.DONE } }),
    ]);

    return {
      OPEN: openCount,
      IN_PROGRESS: inProgressCount,
      DONE: doneCount,
    };
  }

  // Show all records (including deleted)
  async findAllWithDeleted(
    paginationDto?: PaginationDto,
  ): Promise<PaginatedResult<Task>> {
    const { limit = 10, offset = 0 } = paginationDto || {};

    const [data, total] = await this.taskRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      withDeleted: true,
    });

    return {
      data,
      total,
      limit,
      offset,
      hasNext: offset + limit < total,
      hasPrev: offset > 0,
    };
  }

  // Show only deleted records
  async findDeleted(
    paginationDto?: PaginationDto,
  ): Promise<PaginatedResult<Task>> {
    const { limit = 10, offset = 0 } = paginationDto || {};

    const [data, total] = await this.taskRepository.findAndCount({
      where: { deletedAt: Not(IsNull()) }, // Only deleted records
      order: { deletedAt: 'DESC' },
      take: limit,
      skip: offset,
      withDeleted: true,
    });

    return {
      data,
      total,
      limit,
      offset,
      hasNext: offset + limit < total,
      hasPrev: offset > 0,
    };
  }

  // Restore deleted record
  async restore(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      withDeleted: true, // Find even deleted records
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (!task.deletedAt) {
      throw new Error('Task is not deleted');
    }

    await this.taskRepository.restore(id);
    const restoredTask = await this.taskRepository.findOne({ where: { id } });

    if (!restoredTask) {
      throw new NotFoundException('Failed to restore task');
    }

    return restoredTask;
  }

  // Hard Delete - physically delete record forever
  async forceRemove(id: number): Promise<{ message: string }> {
    const task = await this.taskRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await this.taskRepository.remove(task);
    return { message: 'Task permanently deleted' };
  }

  async toggleStatus(id: number): Promise<Task> {
    const task = await this.findOne(id);

    switch (task.status) {
      case TaskStatus.OPEN:
        task.status = TaskStatus.IN_PROGRESS;
        break;
      case TaskStatus.IN_PROGRESS:
        task.status = TaskStatus.DONE;
        break;
      case TaskStatus.DONE:
        task.status = TaskStatus.OPEN;
        break;
    }

    return await this.taskRepository.save(task);
  }

  async updateStatus(id: number, status: TaskStatus): Promise<Task> {
    const task = await this.findOne(id);
    task.status = status;
    return await this.taskRepository.save(task);
  }
}
