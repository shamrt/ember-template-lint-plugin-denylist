import { ASTHelpers as helpers, Rule } from 'ember-template-lint';
import { AST } from 'ember-template-recast';
import createErrorMessage from 'ember-template-lint/lib/helpers/create-error-message';
import { difference } from 'lodash';

import { FullDenylistConfig } from '../types';

export const DEFAULT_CONFIG = { attributes: [] };

/**
 * Predicate for correctly configured attributes.
 *
 * @param attributes Configured attributes
 * @returns Evaluation of valid attributes
 * @private
 */
const isValidAttributes = (attributes: unknown): boolean =>
  Array.isArray(attributes) &&
  attributes.every((attribute) => {
    const attributeKeys = Object.keys(attribute).sort();
    return difference(attributeKeys, ['name', 'values']).length === 0;
  });

/**
 * Extract stringified values from attribute.
 *
 * @param attribute AST attribute node
 * @returns String of attribute values
 */
const getAttributeValues = (attribute: AST.AttrNode): string => {
  switch (attribute.value.type) {
    case 'MustacheStatement':
      return '';
    case 'ConcatStatement':
      const parts = attribute?.value?.parts ?? [];
      return parts
        .filter((part): part is AST.TextNode => part.type === 'TextNode')
        .map((part) => part.chars)
        .join(' ');
    case 'TextNode':
      return attribute.value.chars;
  }
};

/**
 * Predicate for whether a provided raw value is forbidden.
 *
 * @param attributeValues Attribute values
 * @param rawValue Raw forbidden value
 * @returns Evaluation of value acceptability
 * @private
 */
const hasForbiddenAttribute = (
  attributeValues: string,
  rawValue: string
): boolean => {
  if (rawValue.startsWith('^') && rawValue.endsWith('$')) {
    const value = rawValue.slice(1, -1);
    return attributeValues.split(' ').includes(value);
  } else if (rawValue.startsWith('^')) {
    const value = rawValue.slice(1);
    return attributeValues
      .split(' ')
      .some((attributeValue) => attributeValue.startsWith(value));
  } else if (rawValue.endsWith('$')) {
    const value = rawValue.slice(0, -1);
    return attributeValues
      .split(' ')
      .some((attributeValue) => attributeValue.endsWith(value));
  } else {
    return attributeValues.includes(rawValue);
  }
};

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

          const attributeValues = getAttributeValues(attribute);

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
