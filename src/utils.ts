import { App, TFile, TFolder } from "obsidian";
import { VIEW_TYPE, FileTreeView } from './FileTreeView';

export class FileTreeUtils {

    static folderSelector = ".workspace-leaf-content[data-type='file-explorer'] .nav-folder-title[data-path]"

    // This will be run only after vault changes
    static checkFoldersForSubFolders = (app: App) => {
        var folderNodes = document.querySelectorAll(FileTreeUtils.folderSelector);
        folderNodes.forEach(node => {
            var dataPath = node.getAttr('data-path');
            if (dataPath && FileTreeUtils.hasChildFolder(dataPath, app)) {
                node.setAttribute('has-child-folder', 'true');
            }
        })
    }

    // This check will be run only when the plugin is loaded
    static initialCheckForSubFolders = (app: App) => {
        var fileExplorers = app.workspace.getLeavesOfType('file-explorer');
        fileExplorers.forEach(fileExplorer => {
            // @ts-ignore
            for (const [path, fileItem] of Object.entries(fileExplorer.view.fileItems)) {
                let fileExplorerNode: HTMLElement = fileItem.titleEl;
                if (fileExplorerNode.className = 'nav-folder-title') {
                    var dataPath = fileExplorerNode.getAttr('data-path');
                    if (dataPath && FileTreeUtils.hasChildFolder(dataPath, app)) {
                        fileExplorerNode.setAttribute('has-child-folder', 'true');
                    }
                }
            }
        })
    }

    static addEventListenerForFolders = (app: App) => {
        document.body.on("click", FileTreeUtils.folderSelector,
            (event, navFolderTitleEl) => {
                FileTreeUtils.setFileTreeFiles(navFolderTitleEl.getAttr('data-path'), app);
            }, true)
    };

    static removeEventListenerForFolders = (app: App) => {
        document.body.off("click",
            FileTreeUtils.folderSelector, (event, navFolderTitleEl) => {
                FileTreeUtils.setFileTreeFiles(navFolderTitleEl.getAttr('data-path'), app);
            }, true)
    };

    static setFileTreeFiles = (folderPath: string, app: App, vaultChange?: boolean) => {
        // Set File List Under View
        var filetreeViews = app.workspace.getLeavesOfType(VIEW_TYPE);
        filetreeViews.forEach(leaf => {
            const view = leaf.view as FileTreeView;
            view.constructFileTree(folderPath, vaultChange);
        })
        if (vaultChange) FileTreeUtils.checkFoldersForSubFolders(app);
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