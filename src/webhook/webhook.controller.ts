import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { RegisterWebhookDto } from './dto/register-webhook.dto';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post(':taskId')
  @ApiOperation({
    summary: 'Register webhook URL for due date notifications',
    description:
      'Registers a webhook URL to receive notifications when a task due date is approaching',
  })
  @ApiParam({
    name: 'taskId',
    type: 'number',
    description: 'Task identifier',
    example: 1,
  })
  @ApiBody({
    type: RegisterWebhookDto,
    description: 'Webhook registration data: { url: string }',
    examples: {
      'webhook-site': {
        summary: 'Webhook.site example',
        description: 'Using webhook.site for testing',
        value: {
          url: 'https://webhook.site/123e4567-e89b-12d3-a456-426614174000',
        },
      },
      'custom-endpoint': {
        summary: 'Custom endpoint example',
        description: 'Using your own API endpoint',
        value: {
          url: 'https://api.myapp.com/webhooks/task-notifications',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Webhook registration confirmation',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Webhook URL successfully registered for task 1',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid URL format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['url must be a URL address'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Task with ID 1 not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async registerWebhook(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() registerWebhookDto: RegisterWebhookDto,
  ) {
    return this.webhookService.registerWebhook(taskId, registerWebhookDto);
  }

  @Delete(':taskId')
  @ApiOperation({
    summary: 'Remove webhook URL from task',
    description: 'Removes the webhook URL from a task, disabling notifications',
  })
  @ApiParam({
    name: 'taskId',
    type: 'number',
    description: 'Task identifier',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook URL successfully removed',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Webhook URL successfully removed for task 1',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Task with ID 1 not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async removeWebhook(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.webhookService.removeWebhook(taskId);
  }
}
