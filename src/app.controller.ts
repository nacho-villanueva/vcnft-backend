import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('resolve')
  async resolveDID(): Promise<any> {
    return this.appService.resolveDID();
  }

  @Get('create')
  async createDID(@Res() res: Response): Promise<any> {
    return res.json(await this.appService.createDID());
  }

  @Get('publish')
  async publishDID(@Res() res: Response): Promise<any> {
    return res.json(await this.appService.publishDID());
  }
}
