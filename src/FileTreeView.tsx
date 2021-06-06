import { ItemView, TFile, WorkspaceLeaf } from 'obsidian';
import React from 'react';
import ReactDOM from 'react-dom';
import FileTreeAlternativePlugin from './main';
import { FileTreeComponent } from './components/FileTreeComponent';

export const VIEW_TYPE = 'file-tree-view';
export const VIEW_DISPLAY_TEXT = 'File Tree View'

export class FileTreeView extends ItemView {

    plugin: FileTreeAlternativePlugin;

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
        var mdFiles = this.plugin.app.vault.getFiles()
        this.constructFileTree(mdFiles, this.app.vault.getName());
    }

    constructFileTree(files: TFile[], folderPath: string) {
        ReactDOM.unmountComponentAtNode(this.contentEl);
        ReactDOM.render(
            <FileTreeComponent
                files={files}
                app={this.app}
                folderPath={folderPath}
            />,
            this.contentEl
        );
    }

}