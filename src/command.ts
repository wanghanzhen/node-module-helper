import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';
import { NODE_MODULES } from './const';
import { handleError } from './utils';

export async function search() {
  if (!vscode.workspace.workspaceFolders?.length) {
    throw new Error('No workspace folder found');
  }

	/**
	 * monorepo is not supported temporarily
	 */
  const folder = vscode.workspace.workspaceFolders[0];

  const nodeModulesFullPath = path.join(folder.uri.path, NODE_MODULES);

  try {
    const directories = await fs.readdir(nodeModulesFullPath);
    const newDirectories = await handleDirectories(directories, nodeModulesFullPath);

    const selected = await vscode.window.showQuickPick(newDirectories, { placeHolder: `${folder.name}/${NODE_MODULES}` });
    if (selected) {
      const result = await vscode.workspace.openTextDocument(path.join(nodeModulesFullPath, selected, 'package.json'));
      vscode.window.showTextDocument(result);
    }
  } catch (error: any) {
    handleError(error);
  }
}

/**
 * dirname starts with @ is not a full npm package name
 * so we need to find the subdirectory as npm package name
 * @some-scope -> @some-scope/package-name
 */
async function handleDirectories(directories: string[], rootPath: string) {
  const newDirectories = [];

  for (const directory of directories) {
    if (directory.startsWith('.')) {
      continue;
    }

    if (directory.startsWith('@')) {
      const subDirectories = await fs.readdir(path.join(rootPath, directory));
      if (subDirectories.length) {
        newDirectories.push(...subDirectories.map((subDirectory) => path.join(directory, subDirectory)));
      }
      continue;
    }

    newDirectories.push(directory);
  }
  return newDirectories;
}
