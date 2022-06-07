function _stringifyArray(arr: Readonly<Array<Readonly<Record<string | number, any>>>>, level: number, seen: Readonly<Set<any>>) {
  const out = [];
  for (const node of arr) {
    out.push(_stringify(node, level + 1, seen) || JSON.stringify(null));
  }
  return '[' + out.join(',') + ']';
}

function _isObject(node: unknown): node is Record<string | number | symbol, any> {
  return (
    typeof node === 'object' &&
    node !== null
  )
}

function _stringifyObject(node: Readonly<Record<string | number, any>>, level: number, seen: Readonly<Set<any>>) {
  if (seen.has(node)) {
    throw new TypeError('Converting circular structure to JSON');
  }

  seen.add(node);

  const keys = Object.keys(node).sort();
  const out = [];

  for (const key of keys) {
    // eslint-disable-next-line security/detect-object-injection
    const value = _stringify(node[key], level + 1, seen);

    if (!value) continue;

    out.push(JSON.stringify(key) + ':' + value);
  }
  seen.delete(node);
  return '{' + out.join(',') + '}';
}

function _hasToJSON(node: unknown): node is ({ toJSON: () => string }) {
  return (
    typeof node === 'object' &&
    node !== null &&
    'toJSON' in node &&
    typeof (node as Record<'toJSON', unknown>).toJSON === 'function'
  );
}

function _stringify(node: any, level: number, seen: Readonly<Set<any>>): string {
  if (_hasToJSON(node)) {
    node = node.toJSON();
  }

  if (node === undefined) {
    return '';
  }

  if (Array.isArray(node)) {
    return _stringifyArray(node, level, seen);
  } else if (_isObject(node)) {
    return _stringifyObject(node, level, seen);
  } else {
    return JSON.stringify(node);
  }
}

function stringify(obj: any): string {
  return _stringify(obj, 0, new Set());
}

export default stringify;
export {
  stringify,
};
