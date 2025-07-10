# NestJS + PostgreSQL Coding Assignment

## 0. Prerequisites

This project uses Docker to run. You can run a PostgreSQL server with the application using:

```bash
docker compose up --build
```

Make sure that the project runs on docker, or provide explicit running instructions at the top of this `README.md` file.

## 1. Scenario

You are tasked with build a simple service for task management. This is a simple task manager, with RESTful verbs to control a database.

## 2. Requirements

The api will support the following operations:

| Endpoint | Method | Description | Request Body | Query Parameters | Response | Status Codes |
|----------|--------|-------------|--------------|------------------|----------|--------------|
| `/tasks` | POST | Create a new task | `{ title: string, description?: string, dueDate: string (ISO-8601), status?: string }` | - | Task object | 201 (Created), 400 (Bad Request) |
| `/tasks` | GET | List all tasks with pagination | - | `limit?: number, offset?: number` | Array of tasks with pagination metadata | 200 (OK) |
| `/tasks/:id` | GET | Get a single task by ID | - | - | Task object | 200 (OK), 404 (Not Found) |
| `/tasks/:id` | PATCH | Update an existing task | `{ title?: string, description?: string, status?: string, dueDate?: string }` | - | Updated task object | 200 (OK), 404 (Not Found), 400 (Bad Request) |
| `/tasks/:id` | DELETE | Soft delete a task (mark deleted_at) | - | - | Success message | 200 (OK), 404 (Not Found) |
| `/report` | GET | Get aggregate report of tasks by status | - | - | `{ OPEN: number, IN_PROGRESS: number, DONE: number }` | 200 (OK) |

### Optional

| Endpoint | Method | Description | Request Body | Query Parameters | Response | Status Codes |
|----------|--------|-------------|--------------|------------------|----------|--------------|
| `/webhooks` | POST | Register webhook URL for due date notifications | `{ url: string }` | - | Webhook registration confirmation | 201 (Created), 400 (Bad Request) |

The format of the webhook is to your choosing.

### Additional Notes:

- **Task Status Values**: OPEN, IN_PROGRESS, DONE
- **Default Status**: OPEN (for new tasks)
- **Date Format**: ISO-8601 format for dueDate
- **Soft Delete**: Tasks are marked with `deleted_at` timestamp instead of being permanently removed
- **Webhook Notifications**: System should send POST notifications to registered webhook URLs when tasks approach their due date
- **Pagination**: GET /tasks supports `limit` and `offset` query parameters for pagination

## 3. Tech Constraints

You must use NestJS as provided in this library with PostgreSQL. You may use any other library that you deem fit as long as an explanation for using that library can be provided.

## 4. Evaluation Criteria

1. **Functional completeness** - all required endpoints work.
2. **Code quality & architecture** - controllers ↔ services ↔ DB layers are cleanly separated.
3. **Data modelling** - sensible schema, migrations, constraints & indexes.
4. **Error handling & validation** - appropriate HTTP status codes, DTO validation.
5. **Commit hygiene** - clear, incremental messages.
