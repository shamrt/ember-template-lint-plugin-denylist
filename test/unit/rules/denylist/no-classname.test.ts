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

describe('no-class-name', () => {
  describe('string literal value', () => {
    const config: FullDenylistConfig = {
      attributes: [{ name: 'class', values: 'foo' }],
    };

    generateRuleTests(
      Object.assign(baseRuleHarness, {
        config,

        good: [
          `<div class=""></div>`, // empty class name
          `<div class="bar"></div>`, // different class name
          `<div class="bar baz"></div>`, // multiple class names
        ],

        bad: [
          {
            template: `<div class="foo"></div>`,
            result: {
              message: `The value 'foo' is present in attribute 'class', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 16,
              isFixable: false,
              source: `<div class="foo"></div>`,
            },
          },
          {
            template: `<div class="foobar"></div>`,
            result: {
              message: `The value 'foo' is present in attribute 'class', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 19,
              isFixable: false,
              source: `<div class="foobar"></div>`,
            },
          },
          {
            template: `<div class="foo bar"></div>`,
            result: {
              message: `The value 'foo' is present in attribute 'class', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 20,
              isFixable: false,
              source: `<div class="foo bar"></div>`,
            },
          },
        ],
      })
    );
  });

  describe('array values', () => {
    const config: FullDenylistConfig = {
      attributes: [{ name: 'class', values: ['foo', 'test__'] }],
    };

    generateRuleTests(
      Object.assign(baseRuleHarness, {
        config,

        good: [
          `<div class=""></div>`, // empty class name
          `<div class="yo"></div>`, // different class name
          `<div class="fop test"></div>`, // multiple, incomplete class names
        ],

        bad: [
          {
            template: `<div class="test__quox"></div>`,
            result: {
              message: `The value 'test__' is present in attribute 'class', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 23,
              isFixable: false,
              source: `<div class="test__quox"></div>`,
            },
          },
          {
            template: `<div class="foobar"></div>`,
            result: {
              message: `The value 'foo' is present in attribute 'class', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 19,
              isFixable: false,
              source: `<div class="foobar"></div>`,
            },
          },
        ],
      })
    );
  });

  describe('exact value', () => {
    const config: FullDenylistConfig = {
      attributes: [{ name: 'class', values: '^foo$' }],
    };

    generateRuleTests(
      Object.assign(baseRuleHarness, {
        config,

        good: [
          `<div class=""></div>`, // empty class name
          `<div class="foobar yofoo"></div>`, // not exact match
        ],

        bad: [
          {
            template: `<div class="foo"></div>`,
            result: {
              message: `The value '^foo$' is present in attribute 'class', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 16,
              isFixable: false,
              source: `<div class="foo"></div>`,
            },
          },
        ],
      })
    );
  });

  describe('starts with value', () => {
    const config: FullDenylistConfig = {
      attributes: [{ name: 'class', values: '^test__' }],
    };

    generateRuleTests(
      Object.assign(baseRuleHarness, {
        config,

        good: [
          `<div class=""></div>`, // empty class name
          `<div class="footest__"></div>`, // has prefix
          `<div class="footest__baz"></div>`, // in middle of class
        ],

        bad: [
          // exact match
          {
            template: `<div class="test__"></div>`,
            result: {
              message: `The value '^test__' is present in attribute 'class', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 19,
              isFixable: false,
              source: `<div class="test__"></div>`,
            },
          },
          {
            template: `<div class="test__barbaz"></div>`,
            result: {
              message: `The value '^test__' is present in attribute 'class', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 25,
              isFixable: false,
              source: `<div class="test__barbaz"></div>`,
            },
          },
        ],
      })
    );
  });

  describe('ends with value', () => {
    const config: FullDenylistConfig = {
      attributes: [{ name: 'class', values: 'bar$' }],
    };

    generateRuleTests(
      Object.assign(baseRuleHarness, {
        config,

        good: [
          `<div class=""></div>`, // empty class name
          `<div class="barfoo"></div>`, // has suffix
          `<div class="foobarbaz"></div>`, // in middle of class
        ],

        bad: [
          {
            template: `<div class="bar"></div>`,
            result: {
              message: `The value 'bar$' is present in attribute 'class', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 16,
              isFixable: false,
              source: `<div class="bar"></div>`,
            },
          },
          {
            template: `<div class="foobar"></div>`,
            result: {
              message: `The value 'bar$' is present in attribute 'class', but is forbidden`,
              line: 1,
              column: 5,
              endLine: 1,
              endColumn: 19,
              isFixable: false,
              source: `<div class="foobar"></div>`,
            },
          },
        ],
      })
    );
  });
});
