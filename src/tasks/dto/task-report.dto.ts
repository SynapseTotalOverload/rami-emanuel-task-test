import { ApiProperty } from '@nestjs/swagger';

export class TaskReportDto {
  @ApiProperty({
    description: 'Number of open tasks',
    example: 5,
  })
  OPEN: number;

  @ApiProperty({
    description: 'Number of in progress tasks',
    example: 3,
  })
  IN_PROGRESS: number;

  @ApiProperty({
    description: 'Number of done tasks',
    example: 8,
  })
  DONE: number;
}
