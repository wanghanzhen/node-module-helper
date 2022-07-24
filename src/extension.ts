import * as vscode from 'vscode';
import { search } from './command';
import { GotoDefinitionProvider } from './provider';

export function activate(context: vscode.ExtensionContext) {
  const searchDisposable = vscode.commands.registerCommand('node-modules-helper.search', search);
  const gotoDefinitionDisposable = vscode.languages.registerDefinitionProvider('json', new GotoDefinitionProvider());

  context.subscriptions.push(searchDisposable);
  context.subscriptions.push(gotoDefinitionDisposable);
}

export function deactivate() {}
