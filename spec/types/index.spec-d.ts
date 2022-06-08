import { expectError, expectType } from 'tsd';
import { LicenseGenerator } from "../../types";

expectError(new LicenseGenerator());
expectError(new LicenseGenerator({}));
expectError(new LicenseGenerator({ serial: '' }));
expectError(new LicenseGenerator({ template: 2 }));
expectType<string>(new LicenseGenerator({ template: '' }).generate({ data: {} }));
expectType<Record<string | number, string>>(new LicenseGenerator<{ [key: string]: any }>({ template: '' }).parse({ license: '' }).data);
expectType<boolean>(new LicenseGenerator<{ [key: string]: any }>({ template: '' }).parse({ license: '' }).valid);
expectType<string>(new LicenseGenerator<{ [key: string]: any }>({ template: '' }).parse({ license: '' }).serial);