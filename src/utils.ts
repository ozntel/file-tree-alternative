import { App, TFile, TFolder } from "obsidian";
import { VIEW_TYPE, FileTreeView } from './FileTreeView';

export class FileTreeUtils {

    static folderSelector = ".workspace-leaf-content[data-type='file-explorer'] .nav-folder-title[data-path]"

    static checkFoldersForSubFolders = (app: App) => {
        var folderNodes = document.querySelectorAll(FileTreeUtils.folderSelector);
        folderNodes.forEach(node => {
            var dataPath = node.getAttr('data-path');
            if (dataPath && FileTreeUtils.hasChildFolder(dataPath, app)) {
                node.setAttribute('has-child-folder', 'true');
            }
        })
    }

    static addEventListenerForFolders = (app: App) => {
        document.body.on("click", FileTreeUtils.folderSelector,
            (event, navFolderTitleEl) => {
                FileTreeUtils.setFileTreeFiles(navFolderTitleEl.getAttr('data-path'), app);
                FileTreeUtils.checkFoldersForSubFolders(app);
            }, true)
    };

    static removeEventListenerForFolders = (app: App) => {
        document.body.off("click",
            FileTreeUtils.folderSelector, (event, navFolderTitleEl) => {
                FileTreeUtils.setFileTreeFiles(navFolderTitleEl.getAttr('data-path'), app);
                FileTreeUtils.checkFoldersForSubFolders(app);
            }, true)
    };

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