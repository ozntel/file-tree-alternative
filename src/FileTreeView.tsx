import { ItemView, WorkspaceLeaf } from 'obsidian';
import React from 'react';
import { Root, createRoot } from 'react-dom/client';
import FileTreeAlternativePlugin from './main';
import MainTreeComponent from './components/MainView/MainComponent';
import { RecoilRoot } from 'recoil';

export class FileTreeView extends ItemView {
    plugin: FileTreeAlternativePlugin;
    currentFolderPath: string;
    root: Root;

    constructor(leaf: WorkspaceLeaf, plugin: FileTreeAlternativePlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return this.plugin?.VIEW_TYPE;
    }

    getDisplayText(): string {
        return this.plugin?.VIEW_DISPLAY_TEXT;
    }

    getIcon(): string {
        return this.plugin?.ICON;
    }

    async onClose() {
        this.destroy();
    }

    destroy() {
        if (this.root) this.root.unmount();
    }

    async onOpen(): Promise<void> {
        this.destroy();
        this.constructFileTree(this.app.vault.getRoot().path, '');
    }

    constructFileTree(folderPath: string, vaultChange: string) {
        this.destroy();
        this.root = createRoot(this.contentEl);
        this.root.render(
            <div className="file-tree-plugin-view">
                <RecoilRoot>
                    <MainTreeComponent fileTreeView={this} plugin={this.plugin} />
                </RecoilRoot>
            </div>
        );
    }
}
