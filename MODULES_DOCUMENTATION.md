# Task Manager Application - Module Documentation

## Overview

This is a NestJS-based task management application with PostgreSQL database. The application provides RESTful APIs for task management with webhook notifications for due date alerts. The system is built with a modular architecture following NestJS best practices.

## Project Structure

```
src/
├── app.module.ts              # Root application module
├── app.controller.ts          # Basic health check controller
├── app.service.ts            # Basic application service
├── main.ts                   # Application entry point
├── tasks/                    # Task management module
│   ├── tasks.module.ts       # Task module configuration
│   ├── tasks.controller.ts   # Task REST endpoints
│   ├── tasks.service.ts      # Task business logic
│   ├── entities/
│   │   └── task.entity.ts    # Task database entity
│   └── dto/                  # Data Transfer Objects
│       ├── create-task.dto.ts
│       ├── update-task.dto.ts
│       ├── pagination.dto.ts
│       └── task-report.dto.ts
├── webhook/                  # Webhook management module
│   ├── webhook.module.ts     # Webhook module configuration
│   ├── webhook.controller.ts # Webhook REST endpoints
│   ├── webhook.service.ts    # Webhook business logic
│   └── dto/
│       └── register-webhook.dto.ts
└── scheduler/                # Background task scheduler
    ├── scheduler.module.ts   # Scheduler module configuration
    └── scheduler.service.ts  # Scheduled job logic
```

## Core Modules

### 1. App Module (`src/app.module.ts`)

**Purpose**: Root application module that configures and connects all other modules.

**Key Responsibilities**:
- Configures environment variables using `ConfigModule`
- Sets up TypeORM database connection with PostgreSQL
- Imports and configures all feature modules
- Enables scheduling functionality with `ScheduleModule`

**Configuration**:
- Uses environment variables for database connection
- Auto-loads entities for TypeORM
- Enables database synchronization in development mode
- Imports: `TasksModule`, `WebhookModule`, `SchedulerModule`

**Dependencies**:
- `@nestjs/config` - Environment configuration
- `@nestjs/typeorm` - Database ORM
- `@nestjs/schedule` - Task scheduling

### 2. Tasks Module (`src/tasks/`)

**Purpose**: Core business logic for task management operations.

#### Tasks Entity (`src/tasks/entities/task.entity.ts`)

**Database Schema**:
```typescript
- id: number (Primary Key, Auto-generated)
- title: string (Required)
- description: string (Optional)
- dueDate: Date (Optional, ISO-8601 format)
- status: TaskStatus enum (OPEN, IN_PROGRESS, DONE)
- createdAt: Date (Auto-generated)
- updatedAt: Date (Auto-updated)
- deletedAt: Date (Soft delete timestamp)
- webhookUrl: string (Optional, for notifications)
- webhookSent: boolean (Track notification status)
```

**Features**:
- Soft delete support with `deletedAt` column
- Automatic timestamp management
- Webhook integration fields
- Swagger API documentation annotations

#### Tasks Service (`src/tasks/tasks.service.ts`)

**Core Operations**:
- `create()` - Create new tasks with validation
- `findAll()` - Get paginated list of active tasks
- `findOne()` - Get single task by ID
- `update()` - Update existing task
- `remove()` - Soft delete task
- `getTaskReport()` - Get aggregate statistics by status

**Advanced Operations**:
- `findAllWithDeleted()` - Include soft-deleted tasks
- `findDeleted()` - Show only deleted tasks
- `restore()` - Restore soft-deleted task
- `forceRemove()` - Permanent deletion
- `toggleStatus()` - Cycle through task statuses
- `updateStatus()` - Set specific status

**Pagination Support**:
- Configurable `limit` and `offset` parameters
- Returns metadata: `total`, `hasNext`, `hasPrev`

#### Tasks Controller (`src/tasks/tasks.controller.ts`)

**REST Endpoints**:

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| `POST` | `/tasks` | Create new task | 201, 400 |
| `GET` | `/tasks` | List tasks (paginated) | 200 |
| `GET` | `/tasks/:id` | Get single task | 200, 404 |
| `PATCH` | `/tasks/:id` | Update task | 200, 404, 400 |
| `DELETE` | `/tasks/:id` | Soft delete task | 200, 404 |
| `GET` | `/tasks/report` | Get status report | 200 |

**Features**:
- Comprehensive Swagger documentation
- Input validation with DTOs
- Proper HTTP status codes
- Parameter validation with `ParseIntPipe`

#### DTOs (Data Transfer Objects)

**CreateTaskDto**:
- `title`: Required string (1-255 chars)
- `description`: Optional string (max 1000 chars)
- `dueDate`: Optional ISO-8601 date string
- `status`: Optional enum (OPEN, IN_PROGRESS, DONE)

**UpdateTaskDto**:
- All fields optional for partial updates
- Same validation rules as create

**PaginationDto**:
- `limit`: Optional number (default: 10)
- `offset`: Optional number (default: 0)

**TaskReportDto**:
- Returns counts for each status: `OPEN`, `IN_PROGRESS`, `DONE`

### 3. Webhook Module (`src/webhook/`)

**Purpose**: Manages webhook registrations and notifications for task due dates.

#### Webhook Service (`src/webhook/webhook.service.ts`)

**Core Operations**:
- `registerWebhook()` - Associate webhook URL with task
- `sendWebhookNotification()` - Send HTTP POST to webhook URL
- `removeWebhook()` - Remove webhook association

**Webhook Payload Structure**:
```typescript
{
  taskId: number,
  title: string,
  description?: string,
  dueDate: Date,
  status: string,
  message: string,
  timestamp: string
}
```

**Features**:
- HTTP timeout handling (10 seconds)
- Error logging and handling
- User-Agent identification
- JSON payload formatting

#### Webhook Controller (`src/webhook/webhook.controller.ts`)

**REST Endpoints**:

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| `POST` | `/webhooks/:taskId` | Register webhook URL | 201, 400, 404 |
| `DELETE` | `/webhooks/:taskId` | Remove webhook URL | 200, 404 |

**Features**:
- Task existence validation
- URL format validation
- Comprehensive error responses
- Swagger documentation with examples

#### RegisterWebhookDto
- `url`: Required valid URL string

### 4. Scheduler Module (`src/scheduler/`)

**Purpose**: Background task processing for due date notifications.

#### Scheduler Service (`src/scheduler/scheduler.service.ts`)

**Scheduled Job**: `checkUpcomingTasks()`
- **Frequency**: Every minute (`0 */1 * * * *`)
- **Purpose**: Check for tasks due within 1 hour

**Process Flow**:
1. Query tasks with due dates in next hour
2. Filter tasks with webhook URLs and unsent notifications
3. Send webhook notifications via `WebhookService`
4. Mark notifications as sent on success
5. Log results and errors

**Features**:
- Cron-based scheduling
- Error handling and logging
- Integration with webhook service
- Database transaction safety

## Module Interactions

### Data Flow

1. **Task Creation**:
   ```
   Client → TasksController → TasksService → Database
   ```

2. **Webhook Registration**:
   ```
   Client → WebhookController → WebhookService → Database (update task)
   ```

3. **Due Date Notifications**:
   ```
   SchedulerService → WebhookService → External Webhook URL
   ```

### Dependencies

- **TasksModule**: Core business logic, no external dependencies
- **WebhookModule**: Depends on Task entity for webhook management
- **SchedulerModule**: Depends on TasksModule and WebhookModule for notifications

## Database Design

### Task Table Schema
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  status ENUM('open', 'in_progress', 'done') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  webhook_url VARCHAR(500),
  webhook_sent BOOLEAN DEFAULT FALSE
);
```

### Key Features
- **Soft Deletes**: `deleted_at` column for data preservation
- **Audit Trail**: `created_at` and `updated_at` timestamps
- **Webhook Integration**: `webhook_url` and `webhook_sent` fields
- **Status Management**: Enum-based status tracking

## API Documentation

The application includes comprehensive Swagger/OpenAPI documentation available at `/api` endpoint when running in development mode.

### Example API Usage

**Create Task**:
```bash
POST /tasks
{
  "title": "Complete project",
  "description": "Finish the backend API",
  "dueDate": "2024-01-15T10:30:00.000Z",
  "status": "open"
}
```

**Register Webhook**:
```bash
POST /webhooks/1
{
  "url": "https://webhook.site/your-unique-url"
}
```

**Get Task Report**:
```bash
GET /tasks/report
# Returns: { "OPEN": 5, "IN_PROGRESS": 3, "DONE": 8 }
```

## Error Handling

The application implements comprehensive error handling:

- **Validation Errors**: 400 Bad Request for invalid input
- **Not Found**: 404 for missing resources
- **Database Errors**: Proper exception handling
- **Webhook Failures**: Graceful degradation with logging

## Security Considerations

- Input validation using class-validator
- SQL injection prevention via TypeORM
- Webhook URL validation
- Request timeout handling
- Error message sanitization

## Performance Features

- **Pagination**: Efficient data retrieval for large datasets
- **Indexing**: Database indexes on frequently queried fields
- **Soft Deletes**: Maintains data integrity while allowing "deletion"
- **Scheduled Jobs**: Background processing for notifications

## Deployment

The application is containerized with Docker and includes:
- `Dockerfile` for application container
- `docker-compose.yml` for PostgreSQL and app orchestration
- Environment-based configuration
- Health check endpoints

## Testing

The project includes:
- E2E test configuration (`test/`)
- Jest testing framework
- Integration test examples

This modular architecture provides a scalable, maintainable task management system with webhook notifications and comprehensive API documentation. 
