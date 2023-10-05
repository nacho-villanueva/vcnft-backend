import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import {
  Agent,
  AgentModenaRegistry,
  AgentModenaResolver,
  AgentModenaUniversalRegistry,
  AgentModenaUniversalResolver,
  CredentialFlow,
  IAgentStorage,
  WACICredentialOfferSucceded,
  WACIProtocol,
} from '@extrimian/agent';
import { KMSClient } from '@extrimian/kms-client';
import { LANG, Suite } from '@extrimian/kms-core';
import {
  AssertionMethodPurpose,
  KeyAgreementPurpose,
} from '@extrimian/did-core';
import { CreateDIDResponse, Did } from '@extrimian/did-registry';

export class FileSystemStorage implements IAgentStorage {
  public readonly filepath: string;

  constructor(params: { filepath: string }) {
    this.filepath = params.filepath;
  }

  async update<T>(key: string, value: T): Promise<void> {
    const map = this.getData();
    map.set(key, value as T);
    this.saveData(map);
  }

  async getAll<T>(): Promise<Map<string, any>> {
    return this.getData();
  }

  async remove(key: string): Promise<void> {
    const map = this.getData();
    map.delete(key);
    this.saveData(map);
  }

  async add(key: string, data: any): Promise<void> {
    const map = this.getData();
    map.set(key, data);
    this.saveData(map);
  }

  async get(key: string): Promise<any> {
    return this.getData().get(key);
  }

  private getData(): Map<string, any> {
    if (!existsSync(this.filepath)) {
      return new Map();
    }

    const file = readFileSync(this.filepath, {
      encoding: 'utf-8',
    });

    if (!file) {
      return new Map();
    }

    return new Map(Object.entries(JSON.parse(file)));
  }

  private saveData(data: Map<string, any>) {
    writeFileSync(this.filepath, JSON.stringify(Object.fromEntries(data)), {
      encoding: 'utf-8',
    });
  }
}

@Injectable()
export class AppService {
  private agent: Agent;
  constructor() {
    const waciProtocol = new WACIProtocol({
      storage: new FileSystemStorage({ filepath: 'asd-storage' }),
      issuer: {
        issueCredentials: async (
          waciInvitationId: string,
          holderId: string,
        ) => {
          return new WACICredentialOfferSucceded({
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
                  issuer:
                    'did:quarkid:zksync:EiC_pKyUEzxzcocN4F8EIUc1RefcxmL3LwdiVzkEAWqKFQ',
                  issuanceDate: new Date(),
                  credentialSubject: {
                    id: holderId,
                    givenName: 'Jhon',
                    familyName: 'Does',
                  },
                },
                outputDescriptor: {
                  id: 'alumni_credential_output',
                  schema:
                    'https://schema.org/EducationalOccupationalCredential',
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

    //Crear una nueva instancia del agente, se deben pasar los protocolos a usar para la generación de VC (por ejemplo el WACIProtocol que definimos anteriormente)
    this.agent = new Agent({
      agentStorage: new FileSystemStorage({ filepath: 'agent-store' }),
      secureStorage: new FileSystemStorage({ filepath: 'secure-store' }),
      vcStorage: new FileSystemStorage({ filepath: 'vs-store' }),
      didDocumentRegistry: new AgentModenaRegistry(
        'https://demo.extrimian.com/sidetree-zksync-quarkid/',
      ),
      didDocumentResolver: new AgentModenaResolver(
        'https://demo.extrimian.com/sidetree-zksync-quarkid/',
      ),
      vcProtocols: [waciProtocol],
    });

    this.agent.initialize();

    console.log('creating DID');
    this.agent.identity.didCreated.on(async (args) => {
      console.log(args.did);
      this.agent.vc
        .createInvitationMessage({ flow: CredentialFlow.Issuance })
        .then((message) => console.log(message));
    });



    // this.agent.registry.initialize({
    //   kms: new KMSClient({
    //     lang: LANG.en,
    //     storage: new FileSystemStorage({ filepath: 'kms-storage' }),
    //   }),
    // });

    // this.agent.identity.createNewDID({
    //   dwnUrl: 'https://demo.extrimian.com/sidetree-zksync-quarkid/dwn'
    // }).then(r => console.log(r))

    // this.agent.identity
    //   .addDID({
    //     did: DID.from(
    //       'did:quarkid:zksync:EiC_pKyUEzxzcocN4F8EIUc1RefcxmL3LwdiVzkEAWqKFQ',
    //     ),
    //   })
    //   .then((r) => console.log(r));
  }

  static kms = new KMSClient({
    lang: LANG.en,
    storage: new FileSystemStorage({ filepath: 'did-store' }),
  });

  async createDID(): Promise<CreateDIDResponse> {
    const updateKey = await AppService.kms.create(Suite.ES256k);
    const recoveryKey = await AppService.kms.create(Suite.ES256k);

    const didComm = await AppService.kms.create(Suite.DIDComm);
    const bbsbls = await AppService.kms.create(Suite.Bbsbls2020);

    const didService = new Did();

    const didResponse = await didService.createDID({
      recoveryKeys: [recoveryKey.publicKeyJWK],
      updateKeys: [updateKey.publicKeyJWK],
      verificationMethods: [
        {
          id: 'bbsbls',
          type: 'Bls12381G1Key2020',
          publicKeyJwk: bbsbls.publicKeyJWK,
          purpose: [new AssertionMethodPurpose()],
        },
        {
          id: 'didComm',
          type: 'X25519KeyAgreementKey2019',
          publicKeyJwk: didComm.publicKeyJWK,
          purpose: [new KeyAgreementPurpose()],
        },
      ],
    });

    return didResponse;
  }

  async publishDID() {
    const registry = new Did();
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
  //
  // async resolveDID() {
  //   const canonicalId = 'EiAJmbYy-FUFWerA9RKZOvotwS4mbWAgLScTuUP0CkhK6Q';
  //   const resolver = new DIDUniversalResolver({
  //     universalResolverURL:
  //       'https://demo.extrimian.com/sidetree-zksync-quarkid/',
  //   });
  //   return await resolver.resolveDID(canonicalId);
  // }

  async requestCreateCredential() {
    return await this.agent.vc.createInvitationMessage({
      flow: CredentialFlow.Issuance,
    });
  }
}
