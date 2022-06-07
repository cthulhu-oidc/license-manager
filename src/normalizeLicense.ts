import { stringify } from './stringify';
import { License } from './LicenseTemplate';
import { isPrototypeKeyword } from './isPrototypeKeyword';

export function normalizeLicense<T>(data: Readonly<License>) {

  const result = {} as Record<string, string>;

  for (const property in data) {
    if (isPrototypeKeyword(property)) {
      continue;
    }

    /* eslint-disable security/detect-object-injection */
    Object.prototype.hasOwnProperty.call(data, property) && (
      result[property] = typeof data[property] === 'string'
        ? data[property] as string
        : stringify(data[property])
    );
    /* eslint-enable */
  }

  return result as Record<keyof T, string>;
}
