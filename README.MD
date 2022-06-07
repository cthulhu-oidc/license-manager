<div align="center">

[![Build Status](https://github.com/cthulhu-oidc/license-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/cthulhu-oidc/license-generator/actions)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/cthulhu-oidc/license-generator.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/cthulhu-oidc/license-generator/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/cthulhu-oidc/license-generator.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/cthulhu-oidc/license-generator/context:javascript)

[![Known Vulnerabilities](https://snyk.io/test/github/cthulhu-oidc/license-generator/badge.svg)](https://snyk.io/test/github/cthulhu-oidc/license-generator)
[![Security Responsible Disclosure](https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg)](https://github.com/nodejs/security-wg/blob/HEAD/processes/responsible_disclosure_template.md)
[![NPM version](https://img.shields.io/npm/v/@cthulhu-oidc/license-generator.svg?style=flat)](https://www.npmjs.com/package/@cthulhu-oidc/license-generator)
[![NPM downloads](https://img.shields.io/npm/dm/@cthulhu-oidc/license-generator.svg?style=flat)](https://www.npmjs.com/package/@cthulhu-oidc/license-generator)

</div>

# License Generator

A lightweight License file generator and parser for NodeJS. Based on nodejs-license-file.

## Install

```bash
npm i @cthulhu-oidc/license-generator
```

## Generate a keypair using OpenSSL

1. Generate an RSA 2048 bit private key

    `openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048`

2. Extract the public key from an RSA keypair

    `openssl rsa -pubout -in private_key.pem -out public_key.pem`

## Generating license file

```javascript
const licenseFile = require('nodejs-license-file');

const template = [
    '====BEGIN LICENSE====',
    '{{licenseVersion}}',
    '{{applicationVersion}}',
    '{{firstName}}',
    '{{lastName}}',
    '{{email}}',
    '{{expirationDate}}',
    '{{serial}}',
    '=====END LICENSE====='
].join('\n');

try {
 
    const licenseFileContent = licenseFile.generate({
        privateKeyPath: 'path/to/key.pem',
        template,
        data: {
            licenseVersion: '1',
            applicationVersion: '1.0.0',
            firstName: 'Name',
            lastName: 'Last Name',
            email: 'some@email.com',
            expirationDate: '12/10/2025'
        }
    });
    
    console.log(licenseFileContent);

} catch (err) {
    
    console.log(err);
}
```

This will produce a license key, which uses the default template and will look similar to this:
```
====BEGIN LICENSE====
1
1.0.0
Name
Last Name
some@email.com
12/10/2025
xxxxxxxxxxxxxxxxxxxxx
=====END LICENSE=====
```

## Parse and verify license file

```javascript
const licenseFile = require('nodejs-license-file');

try {
 
    const data = licenseFile.parse({
        publicKeyPath: 'path/to/key.pub',
        licensePath: 'path/to/file.lic',
        template
    });
    
    console.log(data);
    
} catch (err) {
    
    console.log(err);
}
```

There is an execution result:
```json
{
    "valid": true,
    "serial": "oZDqoEr2avwhAqwV4HInq9otNzeBeD/azq2yn2jA ...",
    "data": {
        "licenseVersion": "1",
        "applicationVersion": "1.0.0",
        "firstName": "Name",
        "lastName": "Last Name",
        "email": "some@email.com",
        "expirationDate": "12/10/2025"
    }
}
```

NOTICE: All numeric data will be converted to strings after parsing. You need to take care of a parsed data types.

## Parse and verify license string

```javascript
const licenseFile = require('nodejs-license-file');

try {

    const licence = `
====BEGIN LICENSE====
1
1.0.0
Name
Last Name
some@email.com
12/10/2025
xxxxxxxxxxxxxxxxxxxxx
=====END LICENSE=====`;
 
    const data = licenseFile.parse({
        publicKeyPath: 'path/to/key.pub',
        licenseFile: licence,
        template
    });
    
    console.log(data);
    
} catch (err) {
    console.log(err);
}
```

There is an execution result:
```json
{
    "valid": true,
    "serial": "oZDqoEr2avwhAqwV4HInq9otNzeBeD/azq2yn2jA ...",
    "data": {
        "licenseVersion": "1",
        "applicationVersion": "1.0.0",
        "firstName": "Name",
        "lastName": "Last Name",
        "email": "some@email.com",
        "expirationDate": "12/10/2025"
    }
}
```

NOTICE: All numeric data will be converted to strings after parsing. You need to take care of a parsed data types.
