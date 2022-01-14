import { Plugin, addIcon } from 'obsidian';
import { VIEW_TYPE, FileTreeView, ICON } from './FileTreeView';
import { ZoomInIcon, ZoomOutIcon, ZoomOutDoubleIcon, LocationIcon } from './utils/icons';
import { FileTreeAlternativePluginSettings, FileTreeAlternativePluginSettingsTab, DEFAULT_SETTINGS } from './settings';

export const eventTypes = {
    activeFileChange: 'file-tree-alternative-active-file-change',
    refreshView: 'file-tree-alternative-refresh-view',
    revealFile: 'file-tree-alternative-reveal-file',
};

export default class FileTreeAlternativePlugin extends Plugin {
    settings: FileTreeAlternativePluginSettings;
    ribbonIconEl: HTMLElement | undefined = undefined;

    keys = {
        activeFolderPathKey: 'fileTreePlugin-ActiveFolderPath',
        pinnedFilesKey: 'fileTreePlugin-PinnedFiles',
        openFoldersKey: 'fileTreePlugin-OpenFolders',
        customHeightKey: 'fileTreePlugin-CustomHeight',
        focusedFolder: 'fileTreePlugin-FocusedFolder',
    };

    async onload() {
        console.log('Loading Alternative File Tree Plugin');

        addIcon('zoomInIcon', ZoomInIcon);
        addIcon('zoomOutIcon', ZoomOutIcon);
        addIcon('zoomOutDoubleIcon', ZoomOutDoubleIcon);
        addIcon('locationIcon', LocationIcon);

        // Load Settings
        this.addSettingTab(new FileTreeAlternativePluginSettingsTab(this.app, this));
        await this.loadSettings();

        // Register File Tree View
        this.registerView(VIEW_TYPE, (leaf) => {
            return new FileTreeView(leaf, this);
        });

        // Event Listeners
        this.app.workspace.onLayoutReady(async () => await this.openFileTreeLeaf(true));

        // Add Command to Open File Tree Leaf
        this.addCommand({
            id: 'open-file-tree-leaf',
            name: 'Open File Tree Leaf',
            callback: async () => await this.openFileTreeLeaf(true),
        });

        // Add Command to Reveal Active File
        this.addCommand({
            id: 'reveal-active-file',
            name: 'Reveal Active File',
            callback: () => {
                // Activate file tree pane
                let leafs = this.app.workspace.getLeavesOfType(VIEW_TYPE);
                if (leafs.length === 0) this.openFileTreeLeaf(true);
                for (let leaf of leafs) {
                    this.app.workspace.revealLeaf(leaf);
                }
                // Run custom event
                let event = new CustomEvent(eventTypes.revealFile, { detail: { file: this.app.workspace.getActiveFile() } });
                window.dispatchEvent(event);
            },
        });

        // Ribbon Icon For Opening
        this.refreshIconRibbon();
    }

    onunload() {
        console.log('Unloading Alternative File Tree Plugin');
        this.detachFileTreeLeafs();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    refreshIconRibbon = () => {
        this.ribbonIconEl?.remove();
        if (this.settings.ribbonIcon) {
            this.ribbonIconEl = this.addRibbonIcon(ICON, 'File Tree Alternative Plugin', async () => {
                await this.openFileTreeLeaf(true);
            });
        }
    };

    openFileTreeLeaf = async (showAfterAttach: boolean) => {
        if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length == 0) {
            let leaf = this.app.workspace.getLeftLeaf(false);
            await leaf.setViewState({ type: VIEW_TYPE });
            if (showAfterAttach) this.app.workspace.revealLeaf(leaf);
        }
    };

    detachFileTreeLeafs = () => {
        let leafs = this.app.workspace.getLeavesOfType(VIEW_TYPE);
        for (let leaf of leafs) {
            (leaf.view as FileTreeView).destroy();
            leaf.detach();
        }
    };

    refreshTreeLeafs = () => {
        this.detachFileTreeLeafs();
        this.openFileTreeLeaf(true);
    };
}
