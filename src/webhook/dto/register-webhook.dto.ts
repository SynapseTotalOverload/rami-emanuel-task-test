import { IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterWebhookDto {
  @ApiProperty({
    description: 'Webhook URL for receiving due date notifications',
    example: 'https://webhook.site/123e4567-e89b-12d3-a456-426614174000',
    format: 'url',
  })
  @IsString()
  @IsUrl()
  url: string;
}
