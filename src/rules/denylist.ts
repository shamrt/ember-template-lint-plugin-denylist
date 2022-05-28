import { ASTHelpers as helpers, Rule } from 'ember-template-lint';
import { AST } from 'ember-template-recast';
import createErrorMessage from 'ember-template-lint/lib/helpers/create-error-message';
import { difference } from 'lodash';

import { ForbiddenValues, FullDenylistConfig } from '../types';

export const DEFAULT_CONFIG = { attributes: [] };

const isValidAttributes = (attributes: unknown) =>
  Array.isArray(attributes) &&
  attributes.every((attribute) => {
    const attributeKeys = Object.keys(attribute).sort();
    return difference(attributeKeys, ['name', 'values']).length === 0;
  });

const hasForbiddenAttribute = (
  attributeValues: string,
  forbiddenValues: ForbiddenValues
): boolean =>
  Array.isArray(forbiddenValues)
    ? forbiddenValues.some((forbiddenValue) =>
        hasForbiddenAttribute(attributeValues, forbiddenValue)
      )
    : attributeValues.includes(forbiddenValues);

export default class DenylistRule extends Rule {
  parseConfig(config: FullDenylistConfig): FullDenylistConfig {
    if (config === true) {
      return DEFAULT_CONFIG;
    }

    if (config && typeof config === 'object') {
      return {
        attributes: isValidAttributes(config.attributes)
          ? config.attributes
          : [],
      };
    }

    const errorMessage = createErrorMessage(
      'denylist',
      [
        'Please refer to https://github.com/shamrt/ember-template-lint-plugin-denylist/ for details',
      ],
      config
    );

    throw new Error(errorMessage);
  }

  visitor(): { ElementNode: (node: AST.ElementNode) => void } {
    return {
      ElementNode: (node: AST.ElementNode) => {
        for (const configAttribute of this.config.attributes) {
          const { name: attributeName, values: forbiddenValue } =
            configAttribute;
          const attribute = helpers.findAttribute(node, attributeName);

          if (!attribute) {
            continue;
          }

          let attributeValues;
          switch (attribute.value.type) {
            case 'MustacheStatement':
              return;
            case 'ConcatStatement':
              return;
            case 'TextNode':
              attributeValues = attribute.value.chars;
              break;
          }

          const forbiddenValues = Array.isArray(forbiddenValue)
            ? forbiddenValue
            : [forbiddenValue];

          for (const value of forbiddenValues) {
            if (hasForbiddenAttribute(attributeValues, value)) {
              this.log({
                message: `The value '${value}' is present in attribute '${attributeName}', but is forbidden`,
                line: attribute.loc && attribute.loc.start.line,
                column: attribute.loc && attribute.loc.start.column,
                endLine: attribute.loc && attribute.loc.end.line,
                endColumn: attribute.loc && attribute.loc.end.column,
                source: this.sourceForNode(node),
                isFixable: false,
              });
            }
          }
        }
      },
    };
  }
}
