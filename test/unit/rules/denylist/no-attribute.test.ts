import { generateRuleTests } from 'ember-template-lint';

import plugin from '../../../../src';
import { FullDenylistConfig } from '../../../../src/types';

const baseRuleHarness = {
  name: 'denylist',

  groupMethodBefore: beforeEach,
  groupingMethod: describe,
  testMethod: it,
  plugins: [plugin],
};

const ATTRIBUTE_NAMES = ['class', 'id', 'alt', 'title', 'data-testid'];

describe.each(ATTRIBUTE_NAMES)('no-attribute (%s)', (attributeName) => {
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
        ],

        bad: [
          {
            template: `<div ${attributeName}="foo"></div>`,
            result: {
              message: `The value 'foo' is present in attribute '${attributeName}', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 11 + attributeName.length,
              isFixable: false,
              source: `<div ${attributeName}="foo"></div>`,
            },
          },
          {
            template: `<div ${attributeName}="foobar"></div>`,
            result: {
              message: `The value 'foo' is present in attribute '${attributeName}', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 14 + attributeName.length,
              isFixable: false,
              source: `<div ${attributeName}="foobar"></div>`,
            },
          },
          {
            template: `<div ${attributeName}="foo bar"></div>`,
            result: {
              message: `The value 'foo' is present in attribute '${attributeName}', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 15 + attributeName.length,
              isFixable: false,
              source: `<div ${attributeName}="foo bar"></div>`,
            },
          },
        ],
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
          {
            template: `<div ${attributeName}="test__quox"></div>`,
            result: {
              message: `The value 'test__' is present in attribute '${attributeName}', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 18 + attributeName.length,
              isFixable: false,
              source: `<div ${attributeName}="test__quox"></div>`,
            },
          },
          {
            template: `<div ${attributeName}="foobar"></div>`,
            result: {
              message: `The value 'foo' is present in attribute '${attributeName}', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 14 + attributeName.length,
              isFixable: false,
              source: `<div ${attributeName}="foobar"></div>`,
            },
          },
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

        bad: [
          {
            template: `<div ${attributeName}="foo"></div>`,
            result: {
              message: `The value '^foo$' is present in attribute '${attributeName}', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 11 + attributeName.length,
              isFixable: false,
              source: `<div ${attributeName}="foo"></div>`,
            },
          },
        ],
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

        bad: [
          // exact match
          {
            template: `<div ${attributeName}="test__"></div>`,
            result: {
              message: `The value '^test__' is present in attribute '${attributeName}', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 14 + attributeName.length,
              isFixable: false,
              source: `<div ${attributeName}="test__"></div>`,
            },
          },
          {
            template: `<div ${attributeName}="test__barbaz"></div>`,
            result: {
              message: `The value '^test__' is present in attribute '${attributeName}', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 20 + attributeName.length,
              isFixable: false,
              source: `<div ${attributeName}="test__barbaz"></div>`,
            },
          },
        ],
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

        bad: [
          {
            template: `<div ${attributeName}="bar"></div>`,
            result: {
              message: `The value 'bar$' is present in attribute '${attributeName}', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 11 + attributeName.length,
              isFixable: false,
              source: `<div ${attributeName}="bar"></div>`,
            },
          },
          {
            template: `<div ${attributeName}="foobar"></div>`,
            result: {
              message: `The value 'bar$' is present in attribute '${attributeName}', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 14 + attributeName.length,
              isFixable: false,
              source: `<div ${attributeName}="foobar"></div>`,
            },
          },
        ],
      })
    );
  });
});
