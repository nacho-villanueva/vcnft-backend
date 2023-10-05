import { IAgentStorage } from '@extrimian/agent';
import { KMSClient } from '@extrimian/kms-client';
import { CreateDIDResponse } from '@extrimian/did-registry';
export declare class FileSystemStorage implements IAgentStorage {
    readonly filepath: string;
    constructor(params: {
        filepath: string;
    });
    update<T>(key: string, value: T): Promise<void>;
    getAll<T>(): Promise<Map<string, any>>;
    remove(key: string): Promise<void>;
    add(key: string, data: any): Promise<void>;
    get(key: string): Promise<any>;
    private getData;
    private saveData;
}
export declare class AppService {
    private agent;
    constructor();
    static kms: KMSClient;
    createDID(): Promise<CreateDIDResponse>;
    publishDID(): Promise<{
        did: CreateDIDResponse;
        publishedID: import("@extrimian/did-registry/dist/models/publish-did.response").PublishDIDResponse;
    }>;
    requestCreateCredential(): Promise<string>;
}
