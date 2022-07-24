import * as vscode from 'vscode';

export function handleError(error: Error) {
	vscode.window.showErrorMessage(error.message);
}