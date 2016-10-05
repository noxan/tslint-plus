import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';


export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'import-spaces',
    description: 'Import statements must not have additional spaces in between.',
    rationale: '',
    optionsDescription: 'Not configurable.',
    options: null,
    optionExamples: ['true'],
    type: 'maintainability',
  };

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
      return this.applyWithWalker(new ImportFormatWalker(sourceFile, this.getOptions()));
  }
}

class ImportFormatWalker extends Lint.RuleWalker {
  public visitSourceFile(node: ts.SourceFile) {
    const globalScanner = ts.createScanner(ts.ScriptTarget.ES5, false, ts.LanguageVariant.Standard, node.text);

    let line = [];
    Lint.scanAllTokens(globalScanner, scanner => {
      const startPos = scanner.getStartPos();
      const textPos = scanner.getTextPos();
      const tokenKind = scanner.getToken();

      line.push({ startPos, textPos, tokenKind });

      if (tokenKind === ts.SyntaxKind.NewLineTrivia) { // handle EOL
        // FIXME: handle multiple import statements in one line (why ever someone should do that!?)
        const index = line.findIndex(el => el.tokenKind === ts.SyntaxKind.ImportKeyword);
        if (index !== -1) {
          line.slice(index + 1).forEach(el => { // start to list tokens following import keyword
            // console.log(ts.SyntaxKind[el.tokenKind]);
            if (el.tokenKind === ts.SyntaxKind.WhitespaceTrivia) {
              const numberOfSpaces = el.textPos - el.startPos;
              if (numberOfSpaces !== 1) {
                // console.log(el.startPos, el.textPos);
                this.addFailure(this.createFailure(
                  el.startPos,
                  numberOfSpaces,
                  `Do not use multiple spaces (${numberOfSpaces}) to seperate import or from keywords.`
                ));
              }
            }
          });
          // console.log('--------');
        }

        line = [];
      }
    });
  }
}
