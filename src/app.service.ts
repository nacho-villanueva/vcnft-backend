import { Injectable } from '@nestjs/common';
import { DIDUniversalResolver } from '@extrimian/did-resolver';
import {
  KeyAgreementPurpose,
  AssertionMethodPurpose,
} from '@extrimian/did-core';
import { KMSClient } from '@extrimian/kms-client';
import { KMSStorage, LANG, Suite } from '@extrimian/kms-core';
import { CreateDIDResponse, Did } from '@extrimian/did-registry';

class SecureStorage implements KMSStorage {
  map = new Map<string, any>();

  async add(key: string, data: any): Promise<void> {
    this.map.set(key, data);
  }

  async get(key: string): Promise<any> {
    return this.map.get(key);
  }

  async getAll(): Promise<Map<string, any>> {
    return this.map;
  }

  async update(key: string, data: any) {
    this.map.set(key, data);
  }

  async remove(key: string) {
    this.map.delete(key);
  }
}

const kms = new KMSClient({
  lang: LANG.es,
  storage: new SecureStorage(),
});

@Injectable()
export class AppService {
  async createDID(): Promise<CreateDIDResponse> {
    const updateKey = await kms.create(Suite.ES256k);
    const recoveryKey = await kms.create(Suite.ES256k);

    const didComm = await kms.create(Suite.DIDComm);
    const bbsbls = await kms.create(Suite.Bbsbls2020);

    const didService = new Did();

    const longDID = await didService.createDID({
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

    return longDID;
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

  async resolveDID() {
    const canonicalId = 'EiAJmbYy-FUFWerA9RKZOvotwS4mbWAgLScTuUP0CkhK6Q';
    const resolver = new DIDUniversalResolver({
      universalResolverURL:
        'https://demo.extrimian.com/sidetree-zksync-quarkid/',
    });
    return await resolver.resolveDID(canonicalId);
  }
}
