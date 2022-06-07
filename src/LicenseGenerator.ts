import { readFileSync } from 'fs';
import { createSign, createVerify } from "crypto";
import { stringify } from './stringify';
import { License, LicenseTemplate } from './LicenseTemplate';
import { LRUCache } from "mnemonist";

const algorithms = <const>[
  'RSA-MD5',
  'RSA-SHA1',
  'RSA-SHA1-2',
  'RSA-SHA224',
  'RSA-SHA256',
  'RSA-SHA3-224',
  'RSA-SHA3-256',
  'RSA-SHA3-384',
  'RSA-SHA3-512',
  'RSA-SHA384',
  'RSA-SHA512',
  'RSA-SHA512/224',
  'RSA-SHA512/256',
  'RSA-SM3'];
type Algorithm = typeof algorithms[number];


type KeyOrPath<K extends string> =
  (Partial<Record<K, never>> & Record<`${K}Path`, string>) |
  (Record<K, string> & Partial<Record<`${K}Path`, never>>);

type PublicKeyOptions = KeyOrPath<"publicKey">
type PrivateKeyOptions = KeyOrPath<"privateKey">;
type LicenseKeyOptions = KeyOrPath<"license">;
type TemplateOptions = KeyOrPath<"template">;
type CacheSize = { cacheSize?: number };

type DataOptions<T = any> = {
  /**
   * data to sign
   */
  data: Readonly<License<T>>;
}

type AlgorithmOptions = { algorithm?: Algorithm; };

const prototypeKeywords = <const>['constructor', 'prototype', '__proto__']
function isPrototypeKeyword(key: unknown): key is typeof prototypeKeywords[number] {
  return (
    typeof key === 'string' &&
    prototypeKeywords.indexOf(key as typeof prototypeKeywords[number]) !== -1
  )
}

export class LicenseGenerator<T> {
  private template: LicenseTemplate<T>;
  private algorithm: Algorithm;
  private publicKey = '';
  private privateKey = '';
  private lruCache;

  constructor(options: Readonly<TemplateOptions & Partial<PrivateKeyOptions> & Partial<PublicKeyOptions> & CacheSize & AlgorithmOptions>) {
    if (typeof options.template === 'string') {
      this.template = new LicenseTemplate({ template: options.template });
    } else if (typeof options.templatePath === 'string') {
      this.template = new LicenseTemplate({ template: readFileSync(options.templatePath, 'utf8') });
    } else {
      throw new Error("License::constructor::template or templatePath is required");
    }

    this.lruCache = typeof options.cacheSize === 'number'
      ? new LRUCache<string, [Error, null] | [null, ReturnType<typeof this.parse>]>(options.cacheSize)
      : undefined;

    this.algorithm = options.algorithm && algorithms.indexOf(options.algorithm) !== -1
      ? options.algorithm
      : 'RSA-SHA256';

    if (typeof options.privateKey === 'string') {
      this.privateKey = options.privateKey;
    } else if (typeof options.privateKeyPath === 'string') {
      this.privateKey = readFileSync(options.privateKeyPath, 'utf8');
    }

    if (typeof options.publicKey === 'string') {
      this.publicKey = options.publicKey;
    } else if (typeof options.publicKeyPath === 'string') {
      this.publicKey = readFileSync(options.publicKeyPath, 'utf8');
    }
  }

  public generate(options: Readonly<DataOptions<T>>) {

    if (this.privateKey.length === 0) {
      throw new Error("License::generate::privateKey is required");
    }

    if (typeof options.data !== 'object' || options.data === null) {
      throw new Error('License::generate::options.data is required');
    }

    if ('serial' in options.data && Object.prototype.hasOwnProperty.call(options.data, 'serial')) {
      throw new Error('License::generate::data.serial is not allowed');
    }
    const serial = createSign(this.algorithm)
      .update(stringify(_prepareDataObject(options.data)))
      .sign(this.privateKey, 'base64');

    return this.template
      .render({
        ...(options.data as unknown as T),
        serial
      });
  }

  /**
   * Parse license file
   */
  public parse<T = any>(options: Readonly<LicenseKeyOptions>): { valid: boolean; serial: string; data: Record<keyof T, string>; } {

    let license;
    if (typeof options.license === 'string') {
      license = options.license;
    } else if (typeof options.licensePath === 'string') {
      license = readFileSync(options.licensePath, 'utf8');
    } else {
      throw new Error("License::parse::license or licensePath is required");
    }

    if (
      this.lruCache &&
      this.lruCache.has(license)
    ) {
      const cached = this.lruCache.get(license) as unknown as [Error, null] | [null, ReturnType<typeof this.parse>];

      if (cached[0] !== null) {
        throw cached[0];
      } 
      return cached[1] as unknown as { valid: boolean; serial: string; data: Record<keyof T, string>; };
    }
    try {

      if (this.publicKey.length === 0) {
        throw new Error("License::parse::publicKey is required");
      }

      const { serial, data } = this.template.parse(license);

      const valid = createVerify(this.algorithm)
        .update(stringify(data))
        .verify(this.publicKey, serial, 'base64');


      if (this.lruCache) {
        this.lruCache.set(license, [
          null,
          {
            valid,
            serial,
            data: data as unknown as Record<keyof T, string>,
          }]);
      }
      return {
        valid,
        serial,
        data: data as unknown as Record<keyof T, string>,
      };
    } catch (e) {
      if (this.lruCache) {
        this.lruCache.set(license, [e as Error, null]);
      }
      throw e;
    }
  }
}

function _prepareDataObject(data: Readonly<License>) {

  const result = {} as License;

  for (const property in data) {
    if (isPrototypeKeyword(property)) {
      continue;
    }
    /* eslint-disable security/detect-object-injection */
    Object.prototype.hasOwnProperty.call(data, property) && (
      result[property] = typeof data[property] === 'string' ? data[property] as string : stringify(data[property])
    );
    /* eslint-enable */
  }

  return result;
}

export default LicenseGenerator;
