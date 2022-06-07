import { normalizeLicense } from './normalizeLicense';
import { isPrototypeKeyword } from "./isPrototypeKeyword";

type Template = string;

export type License<T = any> = T extends any
  ? { serial?: never;[key: string]: any; }
  : Omit<T, 'serial'> & { serial?: never; };

type Renderer<T> = (data: Record<keyof T, string>) => string; // eslint-disable-line no-unused-vars

const tokenRE = /{{(\w+)}}/g;
const tokenSplitterRE = /(\{\{\w+?\}\})/g

function _generateRenderer<T>(template: Template): Renderer<T> {
  const tokens = template.split(tokenSplitterRE);
  let fnBody = '';
  for (const token of tokens) {
    if (tokenRE.test(token)) {
      fnBody += 'if (!Object.prototype.hasOwnProperty.call(data, \'' + token.slice(2, -2) + '\')) {\n';
      fnBody += 'throw new Error(\'Incorrect payload\');\n';
      fnBody += '}\n';
    }
  }
  fnBody += 'return `';
  for (const token of tokens) {
    if (tokenRE.test(token)) {
      fnBody += '${data.' + token.slice(2, -2) + '}';
    } else {
      fnBody += token;
    }
  }
  fnBody += '`';
  return new Function('data', fnBody) as Renderer<T>; // eslint-disable-line @typescript-eslint/no-implied-eval
}

export class LicenseTemplate<T> {
  private template: Template;
  private _render: Renderer<T>;
  private _templateRE: RegExp;
  private _templateTokens: string[];

  constructor(options: Readonly<{ template: Template }>) {
    this.template = options.template;

    // eslint-disable-next-line security/detect-non-literal-regexp, security-node/non-literal-reg-expr
    this._templateRE = new RegExp(this.template.replace(tokenRE, '(.*)'));
    this._templateTokens = [...this.template.matchAll(tokenRE)]
      .map((match) => match[1]); // eslint-disable-line @typescript-eslint/prefer-readonly-parameter-types

    for (const templateToken of this._templateTokens) {
      if (isPrototypeKeyword(templateToken)) {
        throw new Error(`Invalid token ${templateToken}`);
      }
    }
    this._render = _generateRenderer<T>(this.template);
  }

  render(data: Readonly<T & { serial: string }>): string {
    return this._render(normalizeLicense<T>(data as T));
  }

  parse(license: string) {
    const result = license.match(this._templateRE);

    if (!result) {
      throw new Error(`License is corrupted`);
    }

    let serial: string = '';
    const data = {} as Record<keyof T, string>;
    let i = 0;
    for (const templateToken of this._templateTokens) {
      ++i;
      if (templateToken === 'serial') {
        // eslint-disable-next-line security/detect-object-injection
        serial = result[i];
        continue;
      }
      // eslint-disable-next-line security/detect-object-injection
      data[templateToken as keyof T] = result[i];
    }

    return {
      serial,
      data,
    }
  }
}
