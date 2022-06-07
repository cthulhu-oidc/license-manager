import { expectType } from 'tsd';
import { LicenseGenerator } from "../../types";

expectType<string>(new LicenseGenerator({template: ''}).generate({data: {}}));