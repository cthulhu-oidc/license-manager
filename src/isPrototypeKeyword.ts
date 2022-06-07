const prototypeKeywords = <const>['constructor', 'prototype', '__proto__'];
export function isPrototypeKeyword(key: unknown): key is typeof prototypeKeywords[number] {
  return (
    typeof key === 'string' &&
    prototypeKeywords.indexOf(key as typeof prototypeKeywords[number]) !== -1
  );
}
