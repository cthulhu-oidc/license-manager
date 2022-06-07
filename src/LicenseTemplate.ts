import { stringify } from "./stringify";

type Template = string;

const prototypeKeywords = <const>['constructor', 'prototype', '__proto__']
function isPrototypeKeyword(key: unknown): key is typeof prototypeKeywords[number] {
  return (
    typeof key === 'string' &&
    prototypeKeywords.indexOf(key as typeof prototypeKeywords[number]) !== -1
  )
}

export type License<T = any> = T extends any
  ? { serial?: never;[key: string]: any; }
  : Omit<T, 'serial'> & { serial?: never; };

type Renderer<T> = (data: Record<keyof T, string>) => string;

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
  return new Function('data', fnBody) as Renderer<T>;
}

function _prepareDataObject<T>(data: Readonly<{ [key: string]: any; }>) {

  const result = {} as Record<string, string>;

  for (const property in data) {
    if (isPrototypeKeyword(property)) {
      continue;
    }

    Object.prototype.hasOwnProperty.call(data, property) && (
      result[property] = typeof data[property] === 'string'
        ? data[property] as unknown as string
        : stringify(data[property])
    );
  }

  return result as Record<keyof T, string>;
}

export class LicenseTemplate<T> {
  private template: Template;
  private _render: Renderer<T>;
  private _templateRE: RegExp;
  private _templateTokens: string[];

  constructor(options: Readonly<{ template: Template }>) {
    this.template = options.template;

    this._templateRE = new RegExp(this.template.replace(tokenRE, '(.*)'));
    this._templateTokens = [...this.template.matchAll(tokenRE)]
      .map((match) => match[1]);

    for (const templateToken of this._templateTokens) {
      if (isPrototypeKeyword(templateToken)) {
        throw new Error(`Invalid token ${templateToken}`);
      }
    }
    this._render = _generateRenderer<T>(this.template);
  }

  render(data: Readonly<T & { serial: string }>): string {
    return this._render(_prepareDataObject(data));
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
        serial = result[i];
        continue;
      }
      data[templateToken as keyof T] = result[i];
    }

    return {
      serial,
      data,
    }
  }
}
