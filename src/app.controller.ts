import {Controller, Get, Query, Res, Session} from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { EventsGateway } from './events/events.gateway';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Get('identity/create')
  async generateDID(@Res() res: Response): Promise<any> {
    // return res.json(await this.appService.publishDID());
    return res.json(await this.appService.createDID());
  }

  @Get('test')
  test(@Session() session: Record<string, any>, @Res() res: Response) {
    session.test = session.test ? session.test + 1 : 1;
    return res.json([session.test, session.id]);
  }

  @Get('test2')
  async test2(@Res() res: Response, @Query('id') id: string) {
    this.eventsGateway.sendAll(id);
    return res.json('Hello!');
  }
}
