import { App, TFile } from "obsidian";
import { VIEW_TYPE, FileTreeView } from './FileTreeView';

export class FileTreeUtils {

    static addEventListenerForFolders = (app: App) => {
        var fileExplorers = app.workspace.getLeavesOfType('file-explorer');
        for (let fileExplorer of fileExplorers) {
            // @ts-ignore
            for (const [path, item] of Object.entries(fileExplorer.view.fileItems)) {
                if (item.titleEl.className === 'nav-folder-title') {
                    // Add Click Event for Folder Titles
                    item.titleEl.onClickEvent(() => {
                        FileTreeUtils.setFileTreeFiles(item.titleEl, app);
                    })
                }
            }
        }
    }

    static setFileTreeFiles = (folderTitleNode: HTMLElement, app: App) => {
        var currentDataPath = folderTitleNode.getAttr('data-path');
        // Get All Files Under Folder
        var allFiles = app.vault.getFiles();
        var folderRegex = new RegExp(currentDataPath + '.*')
        var filteredFiles: TFile[] = allFiles.filter(file => file.path.match(folderRegex))
        // Set File List Under View
        var filetreeViews = app.workspace.getLeavesOfType(VIEW_TYPE);
        filetreeViews.forEach(leaf => {
            const view = leaf.view as FileTreeView;
            view.constructFileTree(filteredFiles, currentDataPath);
        })

    }

}