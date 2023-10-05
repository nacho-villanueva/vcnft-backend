import { AppService } from './app.service';
import { Response } from 'express';
import { EventsGateway } from './events/events.gateway';
export declare class AppController {
    private readonly appService;
    private readonly eventsGateway;
    constructor(appService: AppService, eventsGateway: EventsGateway);
    generateDID(res: Response): Promise<any>;
    test(session: Record<string, any>, res: Response): Response<any, Record<string, any>>;
    test2(res: Response, id: string): Promise<Response<any, Record<string, any>>>;
}
