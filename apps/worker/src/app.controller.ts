import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('work')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('process')
  async processWork(@Query('taskId') taskId: string) {
    return this.appService.processTask(taskId);
  }
}
