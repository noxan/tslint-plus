import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';


export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'newlines',
    description: 'Ensures the file does not start with one or multiple newline.',
    rationale: 'A file should rather directly start with content instead of nothing.',
    optionsDescription: 'Not configurable.',
    options: null,
    optionExamples: ['true'],
    type: 'maintainability',
  };

  public static FILE_BEGIN_NEWLINES_FAILURE = 'No empty newlines on file start.';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    if (sourceFile.text.startsWith('\n') || sourceFile.text.startsWith('\r')) {
      return [
        new Lint.RuleFailure(
          sourceFile,
          1,
          1,
          Rule.FILE_BEGIN_NEWLINES_FAILURE,
          this.getOptions().ruleName
        ),
      ];
    }
    return [];
  }
}
