/* eslint-disable @typescript-eslint/ban-types */
/* eslint-ignore max-classes-per-file */
declare module 'ember-template-lint' {
  import { AST } from 'ember-template-recast';

  interface LogArgument {
    message: string;
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
    source: string;
    isFixable?: boolean;
  }

  export class Rule {
    sourceForNode(
      nodeToPrint:
        | AST.ElementNode
        | AST.TextNode
        | AST.MustacheStatement
        | AST.ConcatStatement
    ): string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any;

    mode: 'fix';

    log(argument: LogArgument): void;
  }

  // eslint-disable-next-line unicorn/no-static-only-class
  export class ASTHelpers {
    static findAttribute(
      node: AST.ElementNode,
      attribute: string
    ): AST.AttrNode;
  }

  export function generateRuleTests(arguments: {
    name: string;
    groupingMethod: Function;
    testMethod: Function;
    config: Record<string, unknown> | boolean;
    plugins: Record<string, unknown>[];
    good?: (Record<string, unknown> | string)[];
    bad?: (Record<string, unknown> | string)[];
    skipDisabledTests?: boolean;
    groupingMethodEach?: Function;
    groupMethodBefore?: Function;
    focusMethod?: () => void;
    meta?: object;
  }): void;
}

declare module 'ember-template-lint/lib/helpers/create-error-message';

declare module 'validate-peer-dependencies';
