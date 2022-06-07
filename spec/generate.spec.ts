import { LicenseGenerator } from '../src';
import { expect } from "chai";
import { join } from 'path';

import {
  template,
  rsaPrivateKey,
  LICENSE_VERSION,
  APPLICATION_VERSION,
  FIRST_NAME,
  LAST_NAME,
  EMAIL,
  SOME_NUMBER,
  EXPIRATION_DATE,
  license
} from './index.spec';

describe('generate', () => {

  it('template is required', () => {
    expect(() => {
      // @ts-expect-error
      const licenseGenerator = new LicenseGenerator({
        privateKeyPath: 'private_key.pem',
      });
    }).to.throw('License::constructor::template or templatePath is required');
  });

  it('data is required', () => {
    const licenseGenerator = new LicenseGenerator({
      template,
      privateKey: rsaPrivateKey,
    });

    // @ts-expect-error
    expect(() => licenseGenerator.generate({
    })).to.throw('License::generate::options.data is required');
  });

  it('algorithm can be set', () => {
    const licenseGenerator = new LicenseGenerator({
      template,
      algorithm: 'RSA-MD5',
      privateKey: rsaPrivateKey,
    });

    expect(licenseGenerator.generate({
      data: {
        licenseVersion: LICENSE_VERSION,
        applicationVersion: APPLICATION_VERSION,
        firstName: FIRST_NAME,
        lastName: LAST_NAME,
        email: EMAIL,
        someNumber: SOME_NUMBER,
        expirationDate: EXPIRATION_DATE
      }
    })).to.be.equal(`====BEGIN LICENSE====
Ver: 1
1.0.0
First Name
Last Name
some@email.com - User E-mail
123
2025/09/25
Serial: Q5joaWvxwjm2zogB0FZkymynblpZuyqWIOWnTjU4uT99s31tRtUV2Eh7pK/PiBnvaZ5JeA2XwsQYBxmEUJgdHyGUPKEweh8N5C2H+fAZ+EBcextDcm+lBWZDND8tiDcopfQSBVDxLzFyQAEukVX5b37FSzX8i/aGo8i7ZX4lSn5fOi0Hc7W6f41PpztoXTlRkAhmnNhSxKDVt78VTbihulx1B48uWg6A/Nj76BTqqbQOTW6N/ZXBvudqtVS5rK8sTszDK/eiBa1AbqrYubg+V2zQtytQgRylHsr1pjEnWvikaaEbGfGVcTLGTUWuKCaZgslmMspsJQzMiwCvpzxGNw==
=====END LICENSE=====`)
  });

  it('privateKey or privateKeyPath is required', () => {
    expect(() => {
      const licenseGenerator = new LicenseGenerator({
        template,
      });
      licenseGenerator.generate({
        data: {
          licenseVersion: LICENSE_VERSION,
          applicationVersion: APPLICATION_VERSION,
          firstName: FIRST_NAME,
          lastName: LAST_NAME,
          email: EMAIL,
          someNumber: SOME_NUMBER,
          expirationDate: EXPIRATION_DATE
        }
      });
    }).to.throw('License::generate::privateKey is required');
  });

  it('data.serial is not allowed', () => {
    const licenseGenerator = new LicenseGenerator({
      template,
      privateKey: rsaPrivateKey,
    });

    expect(() => {
      licenseGenerator.generate({
        data: {
          // @ts-expect-error
          serial: 'not allowed',
          licenseVersion: LICENSE_VERSION,
          applicationVersion: APPLICATION_VERSION,
          firstName: FIRST_NAME,
          lastName: LAST_NAME,
          email: EMAIL,
          someNumber: SOME_NUMBER,
          expirationDate: EXPIRATION_DATE
        }
      })
    }).to.throw('License::generate::data.serial is not allowed');
  });

  it('template can not contain prototype polluting tokens', () => {
    expect(() => new LicenseGenerator({
      template: '{{prototype}}',
    })).to.throw('Invalid token prototype');
    expect(() => new LicenseGenerator({
      template: '{{constructor}}',
    })).to.throw('Invalid token constructor');
    expect(() => new LicenseGenerator({
      template: '{{__proto__}}',
    })).to.throw('Invalid token __proto__');
  });

  it('using privateKey', () => {
    const licenseGenerator = new LicenseGenerator({
      template,
      privateKey: rsaPrivateKey,
    });

    expect(licenseGenerator.generate({
      data: {
        licenseVersion: LICENSE_VERSION,
        applicationVersion: APPLICATION_VERSION,
        firstName: FIRST_NAME,
        lastName: LAST_NAME,
        email: EMAIL,
        someNumber: SOME_NUMBER,
        expirationDate: EXPIRATION_DATE
      }
    })).to.be.equal(license);
  });

  it('using privateKeyPath', () => {

    const licenseGenerator = new LicenseGenerator({
      template,
      privateKeyPath: join(__dirname, 'private_key.pem'),
    });

    expect(licenseGenerator.generate({
      data: {
        licenseVersion: LICENSE_VERSION,
        applicationVersion: APPLICATION_VERSION,
        firstName: FIRST_NAME,
        lastName: LAST_NAME,
        email: EMAIL,
        someNumber: SOME_NUMBER,
        expirationDate: EXPIRATION_DATE
      }
    })).to.be.equal(license);
  });

  it('ignores prototype polluting keyword', () => {

    const licenseGenerator = new LicenseGenerator({
      template,
      privateKeyPath: join(__dirname, 'private_key.pem'),
    });

    const fileData = licenseGenerator.generate({
      data: {
        __proto__: 'a',
        prototype: 'a',
        constructor: 'a',
        licenseVersion: LICENSE_VERSION,
        applicationVersion: APPLICATION_VERSION,
        firstName: FIRST_NAME,
        lastName: LAST_NAME,
        email: EMAIL,
        someNumber: SOME_NUMBER,
        expirationDate: EXPIRATION_DATE
      }
    });

    const regExp = new RegExp('^====BEGIN LICENSE====\\n' +
      'Ver: ' + LICENSE_VERSION + '\\n' +
      APPLICATION_VERSION + '\\n' +
      FIRST_NAME + '\\n' +
      LAST_NAME + '\\n' +
      EMAIL + ' - User E-mail\\n' +
      SOME_NUMBER + '\\n' +
      EXPIRATION_DATE + '\\nSerial: (.*)\\n=====END LICENSE=====$');

    expect(fileData).to.match(regExp);

  });

  it('with custom template', () => {

    const licenseGenerator = new LicenseGenerator({
      template,
      privateKeyPath: join(__dirname, 'private_key.pem'),
    });
    const fileData = licenseGenerator.generate({
      data: {
        licenseVersion: LICENSE_VERSION,
        applicationVersion: APPLICATION_VERSION,
        firstName: FIRST_NAME,
        lastName: LAST_NAME,
        email: EMAIL,
        someNumber: SOME_NUMBER,
        expirationDate: EXPIRATION_DATE
      }
    });

    const regExp = new RegExp('^====BEGIN LICENSE====\\n' +
      'Ver: ' + LICENSE_VERSION + '\\n' +
      APPLICATION_VERSION + '\\n' +
      FIRST_NAME + '\\n' +
      LAST_NAME + '\\n' +
      EMAIL + ' - User E-mail\\n' +
      SOME_NUMBER + '\\n' +
      EXPIRATION_DATE + '\\nSerial: (.*)\\n=====END LICENSE=====$');

    expect(fileData).to.match(regExp);

  });

  it('with custom template loaded from file', () => {

    const licenseGenerator = new LicenseGenerator({
      privateKeyPath: join(__dirname, 'private_key.pem'),
      templatePath: join(__dirname, 'template.hbs'),
    });
    const fileData = licenseGenerator.generate({
      data: {
        licenseVersion: LICENSE_VERSION,
        applicationVersion: APPLICATION_VERSION,
        firstName: FIRST_NAME,
        lastName: LAST_NAME,
        email: EMAIL,
        someNumber: SOME_NUMBER,
        expirationDate: EXPIRATION_DATE
      }
    });

    const regExp = new RegExp('^====BEGIN LICENSE====\\n' +
      'Ver: ' + LICENSE_VERSION + '\\n' +
      APPLICATION_VERSION + '\\n' +
      FIRST_NAME + '\\n' +
      LAST_NAME + '\\n' +
      EMAIL + ' - User E-mail\\n' +
      SOME_NUMBER + '\\n' +
      EXPIRATION_DATE + '\\nSerial: (.*)\\n=====END LICENSE=====$');

    expect(fileData).to.match(regExp);

  });
});