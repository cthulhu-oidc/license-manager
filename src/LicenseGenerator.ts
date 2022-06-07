import { readFileSync } from 'fs';
import { createSign, createVerify } from "crypto";
import { stringify } from './stringify';
import { License, LicenseTemplate } from './LicenseTemplate';
import { LRUCache } from "mnemonist";
import { normalizeLicense } from './normalizeLicense';

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

type DataOptions<T = { [key: string]: any; }> = {
  /**
   * data to sign
   */
  data: Readonly<License<T>>;
}

type AlgorithmOptions = { algorithm?: Algorithm; };

type ParseResult<T> = { valid: boolean; serial: string; data: Record<keyof T, string>; };

export class LicenseGenerator<T = { [key: string]: any; }> {
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
      ? new LRUCache<string, [Error, null] | [null, ParseResult<T>]>(options.cacheSize)
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

    const normalizedLicense = normalizeLicense<T>(options.data);
    const serial = createSign(this.algorithm)
      .update(stringify(normalizedLicense))
      .sign(this.privateKey, 'base64');

    return this.template
      .render({
        ...normalizedLicense,
        serial
      });
  }

  /**
   * Parse license file
   */
  public parse(options: Readonly<LicenseKeyOptions>): ParseResult<T> {

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
      const cached = this.lruCache.get(license)!;

      if (cached[0] !== null) {
        throw cached[0];
      }
      return cached[1];
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
            data,
          }]);
      }
      return {
        valid,
        serial,
        data,
      };
    } catch (e) {
      if (this.lruCache) {
        this.lruCache.set(license, [e as Error, null]);
      }
      throw e;
    }
  }
}

export default LicenseGenerator;
