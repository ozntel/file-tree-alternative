import { ItemView, WorkspaceLeaf } from 'obsidian';
import React from 'react';
import ReactDOM from 'react-dom';
import FileTreeAlternativePlugin from './main';
import MainTreeComponent from './components/MainView/MainComponent';
import { RecoilRoot } from 'recoil';

export const VIEW_TYPE = 'file-tree-view';
export const VIEW_DISPLAY_TEXT = 'File Tree';
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
        this.destroy();
    }

    destroy() {
        ReactDOM.unmountComponentAtNode(this.contentEl);
    }

    async onOpen(): Promise<void> {
        this.destroy();
        this.constructFileTree(this.app.vault.getRoot().path, '');
    }

    constructFileTree(folderPath: string, vaultChange: string) {
        this.destroy();
        ReactDOM.render(
            <div className="file-tree-plugin-view">
                <RecoilRoot>
                    <MainTreeComponent fileTreeView={this} plugin={this.plugin} />
                </RecoilRoot>
            </div>,
            this.contentEl
        );
    }
}
