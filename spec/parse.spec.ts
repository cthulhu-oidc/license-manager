import { LicenseGenerator } from '../src';
import { expect } from "chai";
import { join } from 'path';

import {
  template,
  LICENSE_VERSION,
  APPLICATION_VERSION,
  FIRST_NAME,
  LAST_NAME,
  EMAIL,
  SOME_NUMBER,
  EXPIRATION_DATE,
  template2,
  license,
  rsaPublicKey
} from './index.spec';

describe('parse', () => {

  it('template is required', () => {
    expect(() => {
      // @ts-expect-error
      const licenseGenerator = new LicenseGenerator({});
    }).to.throw('License::constructor::template or templatePath is required');
  });

  it('publicKey or publicKeyPath is required', () => {
    expect(() => {
      const licenseGenerator = new LicenseGenerator({
        template
      });
      licenseGenerator.parse({
        license
      });
    }).to.throw('License::parse::publicKey is required');
  });

  it('license or licensePath is required', () => {
    const licenseGenerator = new LicenseGenerator({
      template,
      publicKey: rsaPublicKey,
    });
    expect(() => {
      // @ts-expect-error
      licenseGenerator.parse({
      });
    }).to.throw('License::parse::license or licensePath is required');
  });

  it('with custom template', () => {

    const licenseGenerator = new LicenseGenerator({
      template,
      publicKeyPath: join(__dirname, 'public_key.pem'),
    });

    const data = licenseGenerator.parse({
      licensePath: join(__dirname, 'license.lic')
    });

    expect(Object.keys(data)).to.be.eql(['valid', 'serial', 'data']);
    expect(Object.keys(data.data)).to.be.eql(['licenseVersion', 'applicationVersion', 'firstName', 'lastName', 'email', 'someNumber', 'expirationDate']);

    expect(data.valid).to.be.equal(true);
    expect(data.serial).equal('AQWsPDQL8zhZDl20pe2Upt78+VGIcsbU5ImU6zHADEwR0YdEpRxul2evhCSHpNCVghvBh4ROnGqzSGsUHIqxPY+Yjhpj69yTtorxTnNJTD8DHy27mBuWOTjJ4933zFa4kJqZswYnPBnn2lc4wpUUcNYd+bs76UpiucACtuGSBi7I6IgPwU8NM1j0rrlZpPmX1oHYFDVSHNA91ADi9NVkwK21tKr5qNlvxfN3x8B6N50GzmGIYO4jVeuh4fJqUa6FAHoh2NFmTlZ91msSSv6IZ0erVr5eXKydrkqwzcnVe3VWwCptaa9BCb35zE2YzT+M7/vT92BD2EQMiD725EYJhA==');
    expect(data.data.licenseVersion).be.eql(LICENSE_VERSION);
    expect(data.data.applicationVersion).be.eql(APPLICATION_VERSION);
    expect(data.data.firstName).be.eql(FIRST_NAME);
    expect(data.data.lastName).be.eql(LAST_NAME);
    expect(data.data.email).be.eql(EMAIL);
    expect(data.data.someNumber).be.eql(SOME_NUMBER.toString());
    expect(data.data.expirationDate).be.eql(EXPIRATION_DATE);

  });

  it('with custom template loaded from file', () => {

    const licenseGenerator = new LicenseGenerator({
      templatePath: join(__dirname, 'template.hbs'),
      publicKeyPath: join(__dirname, 'public_key.pem'),
    });

    const data = licenseGenerator.parse({
      licensePath: join(__dirname, 'license.lic')
    });

    expect(Object.keys(data)).to.be.eql(['valid', 'serial', 'data']);
    expect(Object.keys(data.data)).to.be.eql(['licenseVersion', 'applicationVersion', 'firstName', 'lastName', 'email', 'someNumber', 'expirationDate']);

    expect(data.valid).to.be.equal(true);
    expect(data.serial).equal('AQWsPDQL8zhZDl20pe2Upt78+VGIcsbU5ImU6zHADEwR0YdEpRxul2evhCSHpNCVghvBh4ROnGqzSGsUHIqxPY+Yjhpj69yTtorxTnNJTD8DHy27mBuWOTjJ4933zFa4kJqZswYnPBnn2lc4wpUUcNYd+bs76UpiucACtuGSBi7I6IgPwU8NM1j0rrlZpPmX1oHYFDVSHNA91ADi9NVkwK21tKr5qNlvxfN3x8B6N50GzmGIYO4jVeuh4fJqUa6FAHoh2NFmTlZ91msSSv6IZ0erVr5eXKydrkqwzcnVe3VWwCptaa9BCb35zE2YzT+M7/vT92BD2EQMiD725EYJhA==');
    expect(data.data.licenseVersion).be.eql(LICENSE_VERSION);
    expect(data.data.applicationVersion).be.eql(APPLICATION_VERSION);
    expect(data.data.firstName).be.eql(FIRST_NAME);
    expect(data.data.lastName).be.eql(LAST_NAME);
    expect(data.data.email).be.eql(EMAIL);
    expect(data.data.someNumber).be.eql(SOME_NUMBER.toString());
    expect(data.data.expirationDate).be.eql(EXPIRATION_DATE);

  });

  it('lack of placeholders in template', () => {

    const licenseGenerator = new LicenseGenerator({
      template: template2,
      publicKeyPath: join(__dirname, 'public_key.pem'),
    });

    expect(() => {
      licenseGenerator.parse({
        license: license
      });
    }).to.throw('License is corrupted');
  });

  it('with custom template (bad license file)', () => {
    const licenseGenerator = new LicenseGenerator({
      template,
      publicKeyPath: join(__dirname, 'public_key.pem'),
    });

    const data = licenseGenerator.parse({
      license: license.replace(/2025\/09\/25/g, '2045/09/25')
    });

    expect(data.valid).to.be.eql(false);
  });

  it('missing publicKey cached', () => {

    const licenseGenerator = new LicenseGenerator({
      cacheSize: 1,
      template,
    });

    expect(() => licenseGenerator.parse({
      licensePath: join(__dirname, 'license.lic')
    })).to.throw("License::parse::publicKey is required");

    expect(() => licenseGenerator.parse({
      licensePath: join(__dirname, 'license.lic')
    })).to.throw("License::parse::publicKey is required");
  });

  it('with custom template cached', () => {

    const licenseGenerator = new LicenseGenerator({
      cacheSize: 1,
      template,
      publicKeyPath: join(__dirname, 'public_key.pem'),
    });

    licenseGenerator.parse({
      licensePath: join(__dirname, 'license.lic')
    });

    const data = licenseGenerator.parse({
      licensePath: join(__dirname, 'license.lic')
    });

    expect(Object.keys(data)).to.be.eql(['valid', 'serial', 'data']);
    expect(Object.keys(data.data)).to.be.eql(['licenseVersion', 'applicationVersion', 'firstName', 'lastName', 'email', 'someNumber', 'expirationDate']);

    expect(data.valid).to.be.equal(true);
    expect(data.serial).equal('AQWsPDQL8zhZDl20pe2Upt78+VGIcsbU5ImU6zHADEwR0YdEpRxul2evhCSHpNCVghvBh4ROnGqzSGsUHIqxPY+Yjhpj69yTtorxTnNJTD8DHy27mBuWOTjJ4933zFa4kJqZswYnPBnn2lc4wpUUcNYd+bs76UpiucACtuGSBi7I6IgPwU8NM1j0rrlZpPmX1oHYFDVSHNA91ADi9NVkwK21tKr5qNlvxfN3x8B6N50GzmGIYO4jVeuh4fJqUa6FAHoh2NFmTlZ91msSSv6IZ0erVr5eXKydrkqwzcnVe3VWwCptaa9BCb35zE2YzT+M7/vT92BD2EQMiD725EYJhA==');
    expect(data.data.licenseVersion).be.eql(LICENSE_VERSION);
    expect(data.data.applicationVersion).be.eql(APPLICATION_VERSION);
    expect(data.data.firstName).be.eql(FIRST_NAME);
    expect(data.data.lastName).be.eql(LAST_NAME);
    expect(data.data.email).be.eql(EMAIL);
    expect(data.data.someNumber).be.eql(SOME_NUMBER.toString());
    expect(data.data.expirationDate).be.eql(EXPIRATION_DATE);

  });

  it('with custom template (bad license file) cached', () => {
    const licenseGenerator = new LicenseGenerator({
      cacheSize: 1,
      template,
      publicKeyPath: join(__dirname, 'public_key.pem'),
    });

    licenseGenerator.parse({
      license: license.replace(/2025\/09\/25/g, '2045/09/25')
    });

    const data = licenseGenerator.parse({
      license: license.replace(/2025\/09\/25/g, '2045/09/25')
    });

    expect(data.valid).to.be.eql(false);
  });
});
