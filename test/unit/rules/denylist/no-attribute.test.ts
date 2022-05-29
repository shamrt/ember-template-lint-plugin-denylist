import { generateRuleTests } from 'ember-template-lint';

import plugin from '../../../../src';
import { FullDenylistConfig } from '../../../../src/types';

type ErrorLogResult = {
  message: string;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  isFixable: boolean;
  source: string;
};

type BadTestOutput = {
  template: string;
  result: ErrorLogResult;
};

/**
 * Higher-order function for building bad test outputs via provided
 * attribute, forbidden value, and array of attribute values.
 *
 * @private
 */
const buildBadTestsByAttribute =
  (attributeName: string) =>
  (forbiddenValue: string) =>
  (attributeValues: string[]): BadTestOutput[] =>
    attributeValues.map((attributeValue) => ({
      template: `<div ${attributeName}=${attributeValue}></div>`,
      result: {
        message: `The value '${forbiddenValue}' is present in attribute '${attributeName}', but is forbidden`,
        line: 1,
        column: 5,
        endLine: 1,
        endColumn: 6 + attributeValue.length + attributeName.length,
        isFixable: false,
        source: `<div ${attributeName}=${attributeValue}></div>`,
      },
    }));

const baseRuleHarness = {
  name: 'denylist',

  groupMethodBefore: beforeEach,
  groupingMethod: describe,
  testMethod: it,
  plugins: [plugin],
};

const ATTRIBUTE_NAMES = ['class', 'id', 'alt', 'title', 'data-testid'];

describe.each(ATTRIBUTE_NAMES)('no-attribute (%s)', (attributeName) => {
  const buildBadTests = buildBadTestsByAttribute(attributeName);

  describe('string literal value', () => {
    const config: FullDenylistConfig = {
      attributes: [{ name: attributeName, values: 'foo' }],
    };

    generateRuleTests(
      Object.assign(baseRuleHarness, {
        config,

        good: [
          `<div ${attributeName}=""></div>`, // empty class name
          `<div ${attributeName}="bar"></div>`, // different class name
          `<div ${attributeName}="bar baz"></div>`, // multiple class names
          `<div class={{yo}}></div>`, // only mustache statement
          `<div class="{{quox}}"></div>`, // single mustache inside quotes
          `<div class="bar {{baz}}"></div>`, // good class plus mustache
          `<div class="bar-{{baz}}"></div>`, // good class and mustache combined
        ],

        bad: buildBadTests('foo')([
          `"foo"`,
          `"foobar"`,
          `"foo bar"`,
          `"foo {{bar}}"`,
          `"yo {{quox}}-foo"`,
        ]),
      })
    );
  });

  describe('array values', () => {
    const config: FullDenylistConfig = {
      attributes: [{ name: attributeName, values: ['foo', 'test__'] }],
    };

    generateRuleTests(
      Object.assign(baseRuleHarness, {
        config,

        good: [
          `<div ${attributeName}=""></div>`, // empty class name
          `<div ${attributeName}="yo"></div>`, // different class name
          `<div ${attributeName}="fop test"></div>`, // multiple, incomplete class names
        ],

        bad: [
          ...buildBadTests('foo')([`"foobar"`]),
          ...buildBadTests('test__')([`"test__quox"`]),
        ],
      })
    );
  });

  describe('exact value', () => {
    const config: FullDenylistConfig = {
      attributes: [{ name: attributeName, values: '^foo$' }],
    };

    generateRuleTests(
      Object.assign(baseRuleHarness, {
        config,

        good: [
          `<div ${attributeName}=""></div>`, // empty class name
          `<div ${attributeName}="foobar yofoo"></div>`, // not exact match
        ],

        bad: buildBadTests('^foo$')([`"foo"`, `"foo bar"`]),
      })
    );
  });

  describe('starts with value', () => {
    const config: FullDenylistConfig = {
      attributes: [{ name: attributeName, values: '^test__' }],
    };

    generateRuleTests(
      Object.assign(baseRuleHarness, {
        config,

        good: [
          `<div ${attributeName}=""></div>`, // empty class name
          `<div ${attributeName}="footest__"></div>`, // has prefix
          `<div ${attributeName}="footest__baz"></div>`, // in middle of class
        ],

        bad: buildBadTests('^test__')([
          `"test__"`,
          `"test__barbaz"`,
          `"foo test__barbaz"`,
        ]),
      })
    );
  });

  describe('ends with value', () => {
    const config: FullDenylistConfig = {
      attributes: [{ name: attributeName, values: 'bar$' }],
    };

    generateRuleTests(
      Object.assign(baseRuleHarness, {
        config,

        good: [
          `<div ${attributeName}=""></div>`, // empty class name
          `<div ${attributeName}="barfoo"></div>`, // has suffix
          `<div ${attributeName}="foobarbaz"></div>`, // in middle of class
        ],

        bad: buildBadTests('bar$')([`"bar"`, `"foobar"`]),
      })
    );
  });
});
