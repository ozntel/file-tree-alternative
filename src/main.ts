import { Plugin, addIcon, TAbstractFile, Notice } from 'obsidian';
import { FileTreeView } from './FileTreeView';
import { ZoomInIcon, ZoomOutIcon, ZoomOutDoubleIcon, LocationIcon, SpaceIcon } from './utils/icons';
import { FileTreeAlternativePluginSettings, FileTreeAlternativePluginSettingsTab, DEFAULT_SETTINGS } from './settings';
import { VaultChange, eventTypes } from 'utils/types';
import { getBookmarkTitle } from 'utils/Utils';

export default class FileTreeAlternativePlugin extends Plugin {
    settings: FileTreeAlternativePluginSettings;
    ribbonIconEl: HTMLElement | undefined = undefined;

    keys = {
        activeFolderPathKey: 'fileTreePlugin-ActiveFolderPath',
        pinnedFilesKey: 'fileTreePlugin-PinnedFiles',
        openFoldersKey: 'fileTreePlugin-OpenFolders',
        customHeightKey: 'fileTreePlugin-CustomHeight',
        customWidthKey: 'fileTreePlugin-CustomWidth',
        focusedFolder: 'fileTreePlugin-FocusedFolder',
    };

    // File Tree View Variables
    VIEW_TYPE = 'file-tree-view';
    VIEW_DISPLAY_TEXT = 'File Tree';
    ICON = 'sheets-in-box';

    async onload() {
        console.log('Loading Alternative File Tree Plugin');

        addIcon('zoomInIcon', ZoomInIcon);
        addIcon('zoomOutIcon', ZoomOutIcon);
        addIcon('zoomOutDoubleIcon', ZoomOutDoubleIcon);
        addIcon('locationIcon', LocationIcon);
        addIcon('spaceIcon', SpaceIcon);

        // Load Settings
        this.addSettingTab(new FileTreeAlternativePluginSettingsTab(this.app, this));
        await this.loadSettings();

        // Register File Tree View
        this.registerView(this.VIEW_TYPE, (leaf) => {
            return new FileTreeView(leaf, this);
        });

        // Event Listeners
        this.app.workspace.onLayoutReady(async () => {
            if (this.settings.openViewOnStart) {
                await this.openFileTreeLeaf(true);
            }
        });

        // Add Command to Open File Tree Leaf
        this.addCommand({
            id: 'open-file-tree-view',
            name: 'Open File Tree View',
            callback: async () => await this.openFileTreeLeaf(true),
        });

        this.app.workspace.onLayoutReady(() => {
            if (this.settings.bookmarksEvents) {
                this.bookmarksAddEventListener();
            }
        });

        // Add Command to Reveal Active File
        this.addCommand({
            id: 'reveal-active-file',
            name: 'Reveal Active File',
            callback: () => {
                // Activate file tree pane
                let leafs = this.app.workspace.getLeavesOfType(this.VIEW_TYPE);
                if (leafs.length === 0) this.openFileTreeLeaf(true);
                for (let leaf of leafs) {
                    this.app.workspace.revealLeaf(leaf);
                }
                // Run custom event
                let event = new CustomEvent(eventTypes.revealFile, {
                    detail: {
                        file: this.app.workspace.getActiveFile(),
                    },
                });
                window.dispatchEvent(event);
            },
        });

        // Add Command to create a new file under active folder path
        this.addCommand({
            id: ' create-new-note',
            name: 'Create a New Note',
            callback: () => {
                let event = new CustomEvent(eventTypes.createNewNote, {
                    detail: {},
                });
                window.dispatchEvent(event);
            },
        });

        // Add event listener for vault changes
        this.app.vault.on('create', this.onCreate);
        this.app.vault.on('delete', this.onDelete);
        this.app.vault.on('modify', this.onModify);
        this.app.vault.on('rename', this.onRename);

        // Ribbon Icon For Opening
        this.refreshIconRibbon();
    }

    onunload() {
        console.log('Unloading Alternative File Tree Plugin');
        this.detachFileTreeLeafs();
        // Remove event listeners
        this.app.vault.off('create', this.onCreate);
        this.app.vault.off('delete', this.onDelete);
        this.app.vault.off('modify', this.onModify);
        this.app.vault.off('rename', this.onRename);
        this.bookmarksRemoveEventListener();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    bookmarksEventHandler = (event: Event) => {
        // Find the tree-item that includes the bookmarks plugin title
        let treeItem: Element = (event.target as any).closest('.tree-item');
        if (!treeItem) return;
        // If it exists, get the title of the bookmark
        let dataPath: string = treeItem.getAttribute('data-path');
        if (!dataPath || dataPath === '') return;
        // Find the bookmark from the items
        let bookmarkItem = getBookmarkTitle(dataPath);
        // Create Custom Menu only if Shift is Used
        if ((event as any).shiftKey) {
            if (!bookmarkItem) return;
            event.stopImmediatePropagation();
            if (bookmarkItem.type === 'file') {
                // Dispatch Reveal File Event
                let customEvent = new CustomEvent(eventTypes.revealFile, {
                    detail: {
                        file: this.app.vault.getAbstractFileByPath(bookmarkItem.path),
                    },
                });
                window.dispatchEvent(customEvent);
            } else if (bookmarkItem.type === 'folder') {
                event.stopImmediatePropagation();
                // Dispatch Reveal Folder Event
                let customEvent = new CustomEvent(eventTypes.revealFolder, {
                    detail: {
                        folder: this.app.vault.getAbstractFileByPath(bookmarkItem.path),
                    },
                });
                window.dispatchEvent(customEvent);
            } else {
                new Notice('Not a file or folder');
            }
        }
    };

    getBookmarksLeafElement = () => {
        return document.querySelector('.workspace-leaf-content[data-type="bookmarks"]');
    };

    bookmarksAddEventListener = () => {
        this.getBookmarksLeafElement().addEventListener('click', this.bookmarksEventHandler, true);
    };

    bookmarksRemoveEventListener = () => {
        this.getBookmarksLeafElement().removeEventListener('click', this.bookmarksEventHandler, true);
    };

    triggerVaultChangeEvent = (file: TAbstractFile, changeType: VaultChange, oldPath?: string) => {
        let event = new CustomEvent(eventTypes.vaultChange, {
            detail: {
                file: file,
                changeType: changeType,
                oldPath: oldPath ? oldPath : '',
            },
        });
        window.dispatchEvent(event);
    };

    onCreate = (file: TAbstractFile) => this.triggerVaultChangeEvent(file, 'create', '');
    onDelete = (file: TAbstractFile) => this.triggerVaultChangeEvent(file, 'delete', '');
    onModify = (file: TAbstractFile) => this.triggerVaultChangeEvent(file, 'modify', '');
    onRename = (file: TAbstractFile, oldPath: string) => this.triggerVaultChangeEvent(file, 'rename', oldPath);

    refreshIconRibbon = () => {
        this.ribbonIconEl?.remove();
        if (this.settings.ribbonIcon) {
            this.ribbonIconEl = this.addRibbonIcon(this.ICON, 'File Tree Alternative Plugin', async () => {
                await this.openFileTreeLeaf(true);
            });
        }
    };

    openFileTreeLeaf = async (showAfterAttach: boolean) => {
        let leafs = this.app.workspace.getLeavesOfType(this.VIEW_TYPE);
        if (leafs.length == 0) {
            // Needs to be mounted
            let leaf = this.app.workspace.getLeftLeaf(false);
            await leaf.setViewState({ type: this.VIEW_TYPE });
            if (showAfterAttach) this.app.workspace.revealLeaf(leaf);
        } else {
            // Already mounted - show if only selected showAfterAttach
            if (showAfterAttach) {
                leafs.forEach((leaf) => this.app.workspace.revealLeaf(leaf));
            }
        }
    };

    detachFileTreeLeafs = () => {
        let leafs = this.app.workspace.getLeavesOfType(this.VIEW_TYPE);
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
