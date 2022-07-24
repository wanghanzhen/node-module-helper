import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Definition, DefinitionProvider, LocationLink, Position, ProviderResult, TextDocument } from 'vscode';
import { NODE_MODULES } from './const';
import { handleError } from './utils';

export class GotoDefinitionProvider implements DefinitionProvider {
  provideDefinition(document: TextDocument, position: Position): ProviderResult<Definition | LocationLink[]> {
    const fileName = document.fileName;
    const workDir = path.dirname(fileName);
    const range = document.getWordRangeAtPosition(position, /"[^"]*"/);
    const word = document.getText(range).replace(/"/g, '');

    if (!/\/package\.json$/.test(fileName)) {
      return;
    }

    try {
      const json = JSON.parse(document.getText());
      if (!json.dependencies?.[word] && !json.devDependencies?.[word]) {
        return;
      }

      let destPath = `${workDir}/${NODE_MODULES}/${word}/package.json`;

      if (fs.existsSync(destPath)) {
        return [
          {
            targetUri: vscode.Uri.file(destPath),
            originSelectionRange: range,
            targetRange: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
          },
        ];
      }
    } catch (error: any) {
      handleError(error);
		}
  }
}
