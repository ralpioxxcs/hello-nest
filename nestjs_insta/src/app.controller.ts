import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('post')
export class AppController {
  constructor(private readonly appService: AppService) {}

}
