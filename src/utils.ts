import { App, TFile, TFolder } from "obsidian";
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
                        FileTreeUtils.setFileTreeFiles(item.titleEl.getAttr('data-path'), app);
                    })

                    // Check if Folder has subfolder
                    if (FileTreeUtils.hasChildFolder(item.titleEl.getAttr('data-path'), app)) {
                        item.titleEl.setAttribute('has-child-folder', 'true');
                    }
                }
            }
        }
    }

    static setFileTreeFiles = (folderPath: string, app: App) => {

        // Get All Files Under Folder
        var allFiles = app.vault.getFiles();
        var folderRegex = new RegExp(folderPath + '.*')
        var filteredFiles: TFile[] = allFiles.filter(file => file.path.match(folderRegex))
        // Set File List Under View
        var filetreeViews = app.workspace.getLeavesOfType(VIEW_TYPE);
        filetreeViews.forEach(leaf => {
            const view = leaf.view as FileTreeView;
            view.constructFileTree(filteredFiles, folderPath);
        })

    }

    static hasChildFolder = (path: string, app: App) => {
        let folder = app.vault.getAbstractFileByPath(path);
        if (folder instanceof TFolder) {
            for (const child of folder.children) {
                if (child instanceof TFolder) {
                    return true;
                }
            }
        }
        return false;
    }

}