import { generateRuleTests } from 'ember-template-lint';

import plugin from '../../../../src';
import { FullDenylistConfig } from '../../../../src/types';

describe('no-class-name', () => {
  const config: FullDenylistConfig = {
    attributes: [{ name: 'class', values: 'foo' }],
  };

  generateRuleTests({
    name: 'denylist',

    groupMethodBefore: beforeEach,
    groupingMethod: describe,
    testMethod: it,
    plugins: [plugin],

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
      // `<div class="foo bar"></div>`, // multiple class names, with exact `foo` match
      // `<div class="foobar"></div>`, // `foo` substring in class name
    ],
  });
});
