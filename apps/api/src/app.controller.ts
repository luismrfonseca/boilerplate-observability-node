import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('hello')
  getHello() {
    return this.appService.getHello();
  }

  @Get('slow')
  async getSlowOperation() {
    return this.appService.slowOperation();
  }

  @Get('nested')
  async getNestedOperation() {
    return this.appService.nestedOperation();
  }
}
