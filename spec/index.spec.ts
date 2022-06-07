import {
  unlinkSync,
  writeFileSync,
} from 'fs';

/**
 * Some constants
 */
export const LICENSE_VERSION = '1';
export const APPLICATION_VERSION = '1.0.0';
export const FIRST_NAME = 'First Name';
export const LAST_NAME = 'Last Name';
export const EMAIL = 'some@email.com';
export const SOME_NUMBER = 123;
export const EXPIRATION_DATE = '2025/09/25';

export const template = `====BEGIN LICENSE====
Ver: {{licenseVersion}}
{{applicationVersion}}
{{firstName}}
{{lastName}}
{{email}} - User E-mail
{{someNumber}}
{{expirationDate}}
Serial: {{serial}}
=====END LICENSE=====`;

export const template2 = `====BEGIN LICENSE====
Ver: {{licenseVersion}}
Serial: {{serial}}
=====END LICENSE=====`;

export const license = `====BEGIN LICENSE====
Ver: 1
1.0.0
First Name
Last Name
some@email.com - User E-mail
123
2025/09/25
Serial: AQWsPDQL8zhZDl20pe2Upt78+VGIcsbU5ImU6zHADEwR0YdEpRxul2evhCSHpNCVghvBh4ROnGqzSGsUHIqxPY+Yjhpj69yTtorxTnNJTD8DHy27mBuWOTjJ4933zFa4kJqZswYnPBnn2lc4wpUUcNYd+bs76UpiucACtuGSBi7I6IgPwU8NM1j0rrlZpPmX1oHYFDVSHNA91ADi9NVkwK21tKr5qNlvxfN3x8B6N50GzmGIYO4jVeuh4fJqUa6FAHoh2NFmTlZ91msSSv6IZ0erVr5eXKydrkqwzcnVe3VWwCptaa9BCb35zE2YzT+M7/vT92BD2EQMiD725EYJhA==
=====END LICENSE=====`;

export const rsaPrivateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDPJtkI+xdI4fec
018s1iNxSIIFW3ipR1mApZXxmTnCWHubqiZP3+/dmcsfkRd5sr8YeEcp1SQ7xlMg
X0AP0KaywAOsu0Gg1ENpqfwi6egHzTY1oNuehWi+LaRPKoGnWL6WfKQqC+s1BbSo
1YNQJW9MDrar9gPQ4OOuTIY7JfGODkdxiJPuqkD6XkwVNLaw0axz7uOHKKeRtz3S
ewpSBHLgfPTApEjeR8LSSC9Cn4LaGqEATX0PuuBed8JtyHIRW+7fLkxSchdMqzlJ
dx1rJwzCzvs80R8/KR10k14W2Ufwr2+vyiFFA7wviwp7DOfaMH4oh6cKzYWuwjsy
yRghPY8lAgMBAAECggEAQcIPO26ZoaU5uSrQF6eScK+XtqOm1fW0T8ZApwUA9NSp
yGxm5QwtVKcxd7/TN+qqBtaHoJvseJ0oXipeZ6bQhAW4JOj8mFVJYQ144Ixn/7IA
910s2lF3QoeylP7lUX42YgcHBeHqtFYvVzkQCi0X+4jgLA5Yf8IkBHx+T+BnobQM
I9H0a8eQYKX1kPoC5GBKoN1fy3N/0yXQU6BCriJR2WiiWubdW1IYc11llMRL1z81
3r3xJqXm2pdC0o07EF94Gl778njahGkELToC5HoHNcZqqZdJemaoQAKO8olPt9bn
wd4r6begRWuY/3MrgZDSFh2+ECPH9acgKo408Bb8gQKBgQD2yIW4AkzevuW8Noji
/o2O/K2LuFMofMoINX/XsxNBZfZNraSzMyenm2Ax8AntpenhUM4Q9ISncslNa8bT
UznVqOVqFWEIHwQkbfzjSLX4Cml8N2PbEBWmWMjrg5fMWqGICixoyepYdSHESE7P
JyYA3mnoE54x7lUSp+uuIeCi2QKBgQDW42k8hfwSPr1xzwYmTz4r7DR89bo8mbSc
hGmfOQqwq3h61HjpdyeKoi+YSzor4DsFtBPgA+R/GqlrSfebuHELKU0vyxwGAfMr
noO5r3+ngCps28L42sIeejZBSo2Afn6HNn/4E353NPlQsa6nYgTItaq2rFiGL5RQ
7rSqQJUHLQKBgQDQ5O4j03akOi0XQ4ZdtyG2fnacxZtGs1ME3dxohoHvItL579lx
gwS3IJOt0cVlr8Ko4hB8U66SW1zAt1FnApT7IeuH/67SBAcqmxusfJjj7FRcPDq/
bP8WfyMcEJkG91SyZgIvdXN0CzpY/ugO+9F0fNBjDXAkTd0fXJroHG8dCQKBgBMk
YuV/UfsWF64hsPyMpo8nFW3kPdjUIGCo8ve6Dxe5zpuyfarecGlLFU5NtTrfWKKj
bfnQnvQrndfu2N3ISlmiLjwJrc9jMRQ7pKRP2+FB64WS9gVRB2XLoTWjvIMrwX2t
/yxMIEHiOCtWCKbkdmSiujhXlfMuHdovyWw5II1pAoGAVfDXpT1P5YuPla9GMKJ+
EERmmxQQBwsbfVG8DD5YuyUQcIHkPR+6VxMP2OM8QorCThToSlvni1h/Tapwj+C2
qb8UWfUOTwyWfsMRHIjki02yVsT0hY/EPSJIg/OsWd+6tXI3P03rit4+wNfYCiXN
b/a1nQJUj1oWiAzNNMnr0io=
-----END PRIVATE KEY-----`;

export const rsaPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzybZCPsXSOH3nNNfLNYj
cUiCBVt4qUdZgKWV8Zk5wlh7m6omT9/v3ZnLH5EXebK/GHhHKdUkO8ZTIF9AD9Cm
ssADrLtBoNRDaan8IunoB802NaDbnoVovi2kTyqBp1i+lnykKgvrNQW0qNWDUCVv
TA62q/YD0ODjrkyGOyXxjg5HcYiT7qpA+l5MFTS2sNGsc+7jhyinkbc90nsKUgRy
4Hz0wKRI3kfC0kgvQp+C2hqhAE19D7rgXnfCbchyEVvu3y5MUnIXTKs5SXcdaycM
ws77PNEfPykddJNeFtlH8K9vr8ohRQO8L4sKewzn2jB+KIenCs2FrsI7MskYIT2P
JQIDAQAB
-----END PUBLIC KEY-----`;

before(() => {
  writeFileSync(__dirname + '/private_key.pem', rsaPrivateKey);
  writeFileSync(__dirname + '/public_key.pem', rsaPublicKey);
  writeFileSync(__dirname + '/license.lic', license);
  writeFileSync(__dirname + '/template.hbs', template);
});

after(() => {
  unlinkSync(__dirname + '/private_key.pem');
  unlinkSync(__dirname + '/public_key.pem');
  unlinkSync(__dirname + '/license.lic');
  unlinkSync(__dirname + '/template.hbs');
});
