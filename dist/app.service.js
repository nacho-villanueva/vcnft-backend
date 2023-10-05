"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = exports.FileSystemStorage = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const agent_1 = require("@extrimian/agent");
const kms_client_1 = require("@extrimian/kms-client");
const kms_core_1 = require("@extrimian/kms-core");
const did_core_1 = require("@extrimian/did-core");
const did_registry_1 = require("@extrimian/did-registry");
class FileSystemStorage {
    constructor(params) {
        this.filepath = params.filepath;
    }
    async update(key, value) {
        const map = this.getData();
        map.set(key, value);
        this.saveData(map);
    }
    async getAll() {
        return this.getData();
    }
    async remove(key) {
        const map = this.getData();
        map.delete(key);
        this.saveData(map);
    }
    async add(key, data) {
        const map = this.getData();
        map.set(key, data);
        this.saveData(map);
    }
    async get(key) {
        return this.getData().get(key);
    }
    getData() {
        if (!(0, fs_1.existsSync)(this.filepath)) {
            return new Map();
        }
        const file = (0, fs_1.readFileSync)(this.filepath, {
            encoding: 'utf-8',
        });
        if (!file) {
            return new Map();
        }
        return new Map(Object.entries(JSON.parse(file)));
    }
    saveData(data) {
        (0, fs_1.writeFileSync)(this.filepath, JSON.stringify(Object.fromEntries(data)), {
            encoding: 'utf-8',
        });
    }
}
exports.FileSystemStorage = FileSystemStorage;
let AppService = AppService_1 = class AppService {
    constructor() {
        const waciProtocol = new agent_1.WACIProtocol({
            storage: new FileSystemStorage({ filepath: 'asd-storage' }),
            issuer: {
                issueCredentials: async (waciInvitationId, holderId) => {
                    return new agent_1.WACICredentialOfferSucceded({
                        credentials: [
                            {
                                credential: {
                                    '@context': [
                                        'https://www.w3.org/2018/credentials/v1',
                                        'https://www.w3.org/2018/credentials/examples/v1',
                                        'https://w3id.org/security/bbs/v1',
                                    ],
                                    id: 'http://example.edu/credentials/58473',
                                    type: ['VerifiableCredential', 'AlumniCredential'],
                                    issuer: 'did:quarkid:zksync:EiC_pKyUEzxzcocN4F8EIUc1RefcxmL3LwdiVzkEAWqKFQ',
                                    issuanceDate: new Date(),
                                    credentialSubject: {
                                        id: holderId,
                                        givenName: 'Jhon',
                                        familyName: 'Does',
                                    },
                                },
                                outputDescriptor: {
                                    id: 'alumni_credential_output',
                                    schema: 'https://schema.org/EducationalOccupationalCredential',
                                    display: {
                                        title: {
                                            path: ['$.name', '$.vc.name'],
                                            fallback: 'Alumni Credential',
                                        },
                                        subtitle: {
                                            path: ['$.class', '$.vc.class'],
                                            fallback: 'Alumni',
                                        },
                                        description: {
                                            text: 'Credencial que permite validar que es alumno del establecimiento',
                                        },
                                    },
                                    styles: {
                                        background: {
                                            color: '#ff0000',
                                        },
                                        thumbnail: {
                                            uri: 'https://dol.wa.com/logo.png',
                                            alt: 'Universidad Nacional',
                                        },
                                        hero: {
                                            uri: 'https://dol.wa.com/alumnos.png',
                                            alt: 'Alumnos de la universidad',
                                        },
                                        text: {
                                            color: '#d4d400',
                                        },
                                    },
                                },
                            },
                        ],
                        issuer: {
                            name: 'Universidad Nacional',
                            styles: {
                                thumbnail: {
                                    uri: 'https://dol.wa.com/logo.png',
                                    alt: 'Universidad Nacional',
                                },
                                hero: {
                                    uri: 'https://dol.wa.com/alumnos.png',
                                    alt: 'Alumnos de la universidad',
                                },
                                background: {
                                    color: '#ff0000',
                                },
                                text: {
                                    color: '#d4d400',
                                },
                            },
                        },
                        options: {
                            challenge: '508adef4-b8e0-4edf-a53d-a260371c1423',
                            domain: '9rf25a28rs96',
                        },
                    });
                },
            },
        });
        this.agent = new agent_1.Agent({
            agentStorage: new FileSystemStorage({ filepath: 'agent-store' }),
            secureStorage: new FileSystemStorage({ filepath: 'secure-store' }),
            vcStorage: new FileSystemStorage({ filepath: 'vs-store' }),
            didDocumentRegistry: new agent_1.AgentModenaRegistry('https://demo.extrimian.com/sidetree-zksync-quarkid/'),
            didDocumentResolver: new agent_1.AgentModenaResolver('https://demo.extrimian.com/sidetree-zksync-quarkid/'),
            vcProtocols: [waciProtocol],
        });
        this.agent.initialize();
        console.log('creating DID');
        this.agent.identity.didCreated.on(async (args) => {
            console.log(args.did);
            this.agent.vc
                .createInvitationMessage({ flow: agent_1.CredentialFlow.Issuance })
                .then((message) => console.log(message));
        });
    }
    async createDID() {
        const updateKey = await AppService_1.kms.create(kms_core_1.Suite.ES256k);
        const recoveryKey = await AppService_1.kms.create(kms_core_1.Suite.ES256k);
        const didComm = await AppService_1.kms.create(kms_core_1.Suite.DIDComm);
        const bbsbls = await AppService_1.kms.create(kms_core_1.Suite.Bbsbls2020);
        const didService = new did_registry_1.Did();
        const didResponse = await didService.createDID({
            recoveryKeys: [recoveryKey.publicKeyJWK],
            updateKeys: [updateKey.publicKeyJWK],
            verificationMethods: [
                {
                    id: 'bbsbls',
                    type: 'Bls12381G1Key2020',
                    publicKeyJwk: bbsbls.publicKeyJWK,
                    purpose: [new did_core_1.AssertionMethodPurpose()],
                },
                {
                    id: 'didComm',
                    type: 'X25519KeyAgreementKey2019',
                    publicKeyJwk: didComm.publicKeyJWK,
                    purpose: [new did_core_1.KeyAgreementPurpose()],
                },
            ],
        });
        return didResponse;
    }
    async publishDID() {
        const registry = new did_registry_1.Did();
        const did = await this.createDID();
        const publishedID = await registry.publishDID({
            modenaApiURL: 'https://demo.extrimian.com/sidetree-zksync-quarkid/',
            createDIDResponse: did,
        });
        return {
            did: did,
            publishedID: publishedID,
        };
    }
    async requestCreateCredential() {
        return await this.agent.vc.createInvitationMessage({
            flow: agent_1.CredentialFlow.Issuance,
        });
    }
};
exports.AppService = AppService;
AppService.kms = new kms_client_1.KMSClient({
    lang: kms_core_1.LANG.en,
    storage: new FileSystemStorage({ filepath: 'did-store' }),
});
exports.AppService = AppService = AppService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AppService);
//# sourceMappingURL=app.service.js.map