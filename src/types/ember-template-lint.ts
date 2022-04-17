/* eslint-ignore max-classes-per-file */
declare module 'ember-template-lint' {
  import { AST } from 'ember-template-recast';

  interface LogArgument {
    message: string;
    line: number;
    column: number;
    source: string;
    isFixable: boolean;
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

  export class ASTHelpers {
    static findAttribute(
      node: AST.ElementNode,
      attribute: string
    ): AST.AttrNode;
  }
}

declare module 'ember-template-lint/lib/helpers/create-error-message';

declare module 'validate-peer-dependencies';
