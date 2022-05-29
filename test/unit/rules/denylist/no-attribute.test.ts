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
 * Higher-order function for building good tests via provided
 * attribute and array of attribute values.
 *
 * @private
 */
const buildGoodTestsByAttribute =
  (attributeName: string) => (attributeValues: string[]) =>
    attributeValues.map(
      (attributeValue) => `<div ${attributeName}=${attributeValue}></div>`
    );

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
  const buildGoodTests = buildGoodTestsByAttribute(attributeName);
  const buildBadTests = buildBadTestsByAttribute(attributeName);

  describe('string literal value', () => {
    const config: FullDenylistConfig = {
      attributes: [{ name: attributeName, values: 'foo' }],
    };

    generateRuleTests(
      Object.assign(baseRuleHarness, {
        config,

        good: buildGoodTests([
          `""`, // empty attribute value
          `"bar"`, // different attribute value
          `"bar baz"`, // multiple attribute names
          `{{yo}}`, // only mustache statement
          `"{{quox}}"`, // single mustache inside quotes
          `"bar {{baz}}"`, // good attribute value plus a mustache
          `"bar-{{baz}}"`, // good attribute value and mustache combined
        ]),

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

        good: buildGoodTests([
          `""`, // empty attribute value
          `"yo"`, // different attribute value
          `"fop test"`, // multiple, not-quite-bad attribute values
        ]),

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

        good: buildGoodTests([
          `""`, // empty attribute value
          `"foobar yofoo"`, // not exact match
        ]),

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

        good: buildGoodTests([
          `""`, // empty attribute value
          `"footest__"`, // has prefix
          `"footest__baz"`, // in middle of attribute value
        ]),

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

        good: buildGoodTests([
          `""`, // empty attribute value
          `"barfoo"`, // has suffix
          `"foobarbaz"`, // in middle of attribute value
        ]),

        bad: buildBadTests('bar$')([`"bar"`, `"foobar"`]),
      })
    );
  });

  describe('multiple configured attributes', () => {
    const config: FullDenylistConfig = {
      attributes: [
        { name: attributeName, values: 'bar$' },
        { name: 'data-x', values: ['^yo$', 'quox'] },
      ],
    };

    generateRuleTests(
      Object.assign(baseRuleHarness, {
        config,

        good: buildGoodTests([
          `""`, // empty attribute value
          `"barfoo"`, // has suffix
          `"foobarbaz"`, // in middle of attribute value
        ]),

        bad: [
          ...buildBadTests('bar$')([`"bar"`, `"foobar"`]),
          ...buildBadTestsByAttribute('data-x')('^yo$')([`"yo"`]),
          ...buildBadTestsByAttribute('data-x')('quox')([`"quox"`]),
        ],
      })
    );
  });
});
