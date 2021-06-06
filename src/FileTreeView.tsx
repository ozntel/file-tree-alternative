import { ItemView, TFile, WorkspaceLeaf, App } from 'obsidian';
import React from 'react';
import ReactDOM from 'react-dom';
import FileTreeAlternativePlugin from './main';
import { FileTreeComponent } from './components/FileTreeComponent';

export const VIEW_TYPE = 'file-tree-view';
export const VIEW_DISPLAY_TEXT = 'File Tree View'

export class FileTreeView extends ItemView {

    plugin: FileTreeAlternativePlugin;
    currentFolderPath: string;

    constructor(leaf: WorkspaceLeaf, plugin: FileTreeAlternativePlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return VIEW_TYPE;
    }

    getDisplayText(): string {
        return VIEW_DISPLAY_TEXT;
    }

    getIcon(): string {
        return 'go-to-file';
    }

    async onClose() {
        ReactDOM.unmountComponentAtNode(this.contentEl);
    }

    async onOpen(): Promise<void> {
        ReactDOM.unmountComponentAtNode(this.contentEl);
        this.constructFileTree(this.app.vault.getRoot().path);
    }

    getFilesUnderPath = (path: string, app: App): TFile[] => {
        // @todo - recursively get files from children
        // var folderObj = app.vault.getAbstractFileByPath(path);
        // if(folderObj instanceof TFolder) { ... }
        var allFiles = app.vault.getFiles();
        var folderRegex = new RegExp(path + '.*');
        return allFiles.filter(file => file.path.match(folderRegex));
    }

    constructFileTree(folderPath: string, vaultChange?: boolean) {
        var files: TFile[] = [];
        if (vaultChange) {
            files = this.getFilesUnderPath(this.currentFolderPath, this.app);
        } else {
            files = this.getFilesUnderPath(folderPath, this.app);
            this.currentFolderPath = folderPath;
        }
        ReactDOM.unmountComponentAtNode(this.contentEl);
        ReactDOM.render(
            <FileTreeComponent
                files={files}
                app={this.app}
                folderPath={this.currentFolderPath}
            />,
            this.contentEl
        );
    }

}