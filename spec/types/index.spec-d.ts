import { expectType } from 'tsd';
import { LicenseGenerator } from "../../types";

expectType<string>(new LicenseGenerator({template: ''}).generate({data: {}}));
expectType<Record<string | number, string>>(new LicenseGenerator<{[key: string]: any}>({template: ''}).parse({license: ''}).data);
expectType<boolean>(new LicenseGenerator<{[key: string]: any}>({template: ''}).parse({license: ''}).valid);
expectType<string>(new LicenseGenerator<{[key: string]: any}>({template: ''}).parse({license: ''}).serial);