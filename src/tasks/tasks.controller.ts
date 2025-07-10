import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { TasksService, PaginatedResult } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationDto } from './dto/pagination.dto';
import { TaskReportDto } from './dto/task-report.dto';
import { Task } from './entities/task.entity';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new task',
    description: 'Creates a new task with specified parameters',
  })
  @ApiBody({
    type: CreateTaskDto,
    description:
      'Task data: { title: string, description?: string, dueDate: string (ISO-8601), status?: string }',
  })
  @ApiResponse({
    status: 201,
    description: '(Created)',
    type: Task,
  })
  @ApiResponse({
    status: 400,
    description: '(Bad Request)',
  })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get('report')
  @ApiOperation({
    summary: 'Get aggregate report of tasks by status',
    description:
      'Returns count of tasks grouped by their status (OPEN, IN_PROGRESS, DONE)',
  })
  @ApiResponse({
    status: 200,
    description: '(OK)',
    type: TaskReportDto,
    schema: {
      example: {
        OPEN: 5,
        IN_PROGRESS: 3,
        DONE: 8,
      },
    },
  })
  getReport(): Promise<TaskReportDto> {
    return this.tasksService.getTaskReport();
  }

  @Get()
  @ApiOperation({
    summary: 'List all tasks with pagination',
    description:
      'Returns a paginated list of all tasks sorted by creation date',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of tasks to return',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of tasks to skip',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: '(OK)',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Task' },
        },
        total: { type: 'number', example: 50 },
        limit: { type: 'number', example: 10 },
        offset: { type: 'number', example: 0 },
        hasNext: { type: 'boolean', example: true },
        hasPrev: { type: 'boolean', example: false },
      },
    },
  })
  findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Task>> {
    return this.tasksService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single task by ID',
    description: 'Returns a specific task by its identifier',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Task identifier',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '(OK)',
    type: Task,
  })
  @ApiResponse({
    status: 404,
    description: '(Not Found)',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an existing task',
    description: 'Updates an existing task with new data',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Task identifier',
    example: 1,
  })
  @ApiBody({
    type: UpdateTaskDto,
    description:
      'Update data: { title?: string, description?: string, status?: string (open, in_progress, done), dueDate?: string (ISO-8601) }',
  })
  @ApiResponse({
    status: 200,
    description: '(OK)',
    type: Task,
  })
  @ApiResponse({
    status: 404,
    description: '(Not Found)',
  })
  @ApiResponse({
    status: 400,
    description: '(Bad Request)',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft delete a task (mark deleted_at)',
    description:
      'Marks a task as deleted without removing it from the database',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Task identifier',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '(OK)',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Task successfully deleted' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '(Not Found)',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
