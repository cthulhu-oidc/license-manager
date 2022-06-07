import { expect } from "chai";
import { stringify } from "../src/stringify";

describe('stringify', () => {

  describe('nested', () => {
    it('nested', () => {
      const obj = { c: 8, b: [{ z: 6, y: 5, x: 4 }, 7], a: 3 };
      expect(stringify(obj)).to.be.equal('{"a":3,"b":[{"x":4,"y":5,"z":6},7],"c":8}');
    });

    it('cyclic (default)', () => {
      const one = { a: 1 };
      const two = { a: 2, one: one };
      // @ts-ignore
      one.two = two;

      expect(() => stringify(one)).to.throw('Converting circular structure to JSON');
    });

    it('repeated non-cyclic value', () => {
      const one = { x: 1 };
      const two = { a: one, b: one };
      expect(stringify(two)).to.be.equal('{"a":{"x":1},"b":{"x":1}}');
    });

    it('acyclic but with reused obj-property pointers', () => {
      const x = { a: 1 }
      const y = { b: x, c: x }
      expect(stringify(y)).to.be.equal('{"b":{"a":1},"c":{"a":1}}');
    });
  })

  describe('str', () => {
    it('simple object', () => {
      const obj = { c: 6, b: [4, 5], a: 3, z: null };
      expect(stringify(obj)).to.be.equal('{"a":3,"b":[4,5],"c":6,"z":null}');
    });

    it('object with undefined', () => {
      const obj = { a: 3, z: undefined };
      expect(stringify(obj)).to.be.equal('{"a":3}');
    });

    it('array with undefined', () => {
      const obj = [4, undefined, 6];
      expect(stringify(obj)).to.be.equal('[4,null,6]');
    });

    it('object with empty string', () => {
      const obj = { a: 3, z: '' };
      expect(stringify(obj)).to.be.equal('{"a":3,"z":""}');
    });

    it('array with empty string', () => {
      const obj = [4, '', 6];
      expect(stringify(obj)).to.be.equal('[4,"",6]');
    });
  })

  describe('toJSON', () => {
    it('toJSON function', () => {
      const obj = { one: 1, two: 2, toJSON: () => { return { one: 1 }; } };
      expect(stringify(obj)).to.be.equal('{"one":1}');
    });

    it('toJSON returns string', () => {
      const obj = { one: 1, two: 2, toJSON: () => { return 'one'; } };
      expect(stringify(obj)).to.be.equal('"one"');
    });

    it('toJSON returns array', () => {
      const obj = { one: 1, two: 2, toJSON: () => { return ['one']; } };
      expect(stringify(obj)).to.be.equal('["one"]');
    });
  });
});