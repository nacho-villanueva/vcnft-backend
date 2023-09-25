import {Controller, Get, Res, Session} from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get('resolve')
  // async resolveDID(): Promise<any> {
  //   return this.appService.resolveDID();
  // }

  @Get('create')
  async createDID(@Res() res: Response): Promise<any> {
    return res.json(await this.appService.createDID());
  }

  @Get('publish')
  async publishDID(@Res() res: Response): Promise<any> {
    return res.json(await this.appService.publishDID());
  }

  @Get('did/generate')
  async generateDID(@Res() res: Response):Promise<any> {
    return res.json(await this.appService.publishDID())
  }

  @Get('test2')
  async test2(@Res() res: Response):Promise<any> {
    return res.json("asd");
  }

  @Get("request-credential")
  async requestCredential(@Res() res: Response) {
    return res.json(await this.appService.requestCreateCredential());
  }

  @Get("test")
  test(@Session() session: Record<string, any>, @Res() res: Response){
    session.test = session.test ? session.test + 1 : 1;
    return res.json(session.test);
  }
}
