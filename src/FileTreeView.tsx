import { ItemView, WorkspaceLeaf } from 'obsidian';
import React from 'react';
import ReactDOM from 'react-dom';
import FileTreeAlternativePlugin from './main';
import MainTreeComponent from './components/MainComponent';

export const VIEW_TYPE = 'file-tree-view';
export const VIEW_DISPLAY_TEXT = 'File Tree View';
export const ICON = 'sheets-in-box';

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
        return ICON;
    }

    async onClose() {
        this.destroy()
    }

    destroy() {
        ReactDOM.unmountComponentAtNode(this.contentEl);
    }

    async onOpen(): Promise<void> {
        ReactDOM.unmountComponentAtNode(this.contentEl);
        this.constructFileTree(this.app.vault.getRoot().path, '');
    }

    constructFileTree(folderPath: string, vaultChange: string) {
        ReactDOM.unmountComponentAtNode(this.contentEl);
        ReactDOM.render(
            <MainTreeComponent
                fileTreeView={this}
                plugin={this.plugin}
            />,
            this.contentEl
        );
    }

}