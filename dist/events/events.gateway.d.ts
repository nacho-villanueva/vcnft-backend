import { OnGatewayConnection, WsResponse } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Server } from 'socket.io';
export declare class EventsGateway implements OnGatewayConnection {
    server: Server;
    private sessions;
    handleConnection(client: any): void;
    findAll(data: any): Observable<WsResponse<number>>;
    identity(data: number): Promise<number>;
    sendAll(id: string): void;
}
