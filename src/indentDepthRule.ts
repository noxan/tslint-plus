import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'indent-depth',
    description: 'Ensure additional indention rules.',
    rationale: '',
    optionsDescription: 'Not configurable.',
    options: null,
    optionExamples: ['true'],
    type: 'maintainability',
  };

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new IndentDepthWalker(sourceFile, this.getOptions()));
  }
}

class IndentDepthWalker extends Lint.RuleWalker {
  private numberOfSpaces: number;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);

    // TODO: make numberOfSpaces configurable, how to deal with tabs?
    this.numberOfSpaces = 2; // default of 2 spaces
  }

  public visitSourceFile(node: ts.SourceFile) {
    const scanner = ts.createScanner(ts.ScriptTarget.ES5, false, ts.LanguageVariant.Standard, node.text);

    let endOfComment = -1;
    let lastIndentionDepth = 0;

    for (let lineStart of node.getLineStarts()) {
      if (lineStart < endOfComment) {
        // skip checking lines inside multi-line comments
        continue;
      }

      scanner.setTextPos(lineStart);

      let currentScannedType = scanner.scan();
      let fullLeadingWhitespace = '';
      let lastStartPos = -1;

      while (currentScannedType === ts.SyntaxKind.WhitespaceTrivia) {
        const startPos = scanner.getStartPos();
        if (startPos === lastStartPos) {
          break;
        }
        lastStartPos = startPos;

        fullLeadingWhitespace += scanner.getTokenText();
        currentScannedType = scanner.scan();
      }

      // Debug show indention depth in console
      // console.log(fullLeadingWhitespace + '|');

      // TODO: path to work with tabs
      const indentionDepth = fullLeadingWhitespace.length;
      if (indentionDepth % this.numberOfSpaces !== 0) {
        this.addFailure(this.createFailure(
          lineStart,
          indentionDepth,
          `Indention depth is not a multiple of ${this.numberOfSpaces}.`
        ));
      }

      // TODO: path to work with tabs
      const indentionDelta = indentionDepth - lastIndentionDepth;
      if (indentionDelta > this.numberOfSpaces) {
        this.addFailure(this.createFailure(
          lineStart,
          indentionDepth,
          'Indention has increased by more than one level.'
        ));
      }

      lastIndentionDepth = indentionDepth;
    }
  }
}
