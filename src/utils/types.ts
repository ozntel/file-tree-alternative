import { TFolder, TFile } from 'obsidian';

export interface OZFile {
    path: string;
    basename: string;
    extension: string;
    stat: {
        mtime: number;
        ctime: number;
        size: number;
    };
    parent: {
        path: string;
    };
    isFolderNote: boolean;
}

export interface FolderFileCountMap {
    [key: string]: {
        open: number;
        closed: number;
    };
}

export interface FolderTree {
    folder: TFolder;
    children: FolderTree[];
}

// --> app.vault.config
export interface ObsidianVaultConfig {
    newLinkFormat: 'shortest' | 'relative' | 'absolute';
    useMarkdownLinks: boolean;
}

export type VaultChange = 'create' | 'delete' | 'rename' | 'modify';

export class CustomVaultChangeEvent extends Event {
    detail: {
        file: TFile;
        changeType: VaultChange;
        oldPath: string;
    };
}

export const eventTypes = {
    activeFileChange: 'fta-active-file-change',
    refreshView: 'fta-refresh-view',
    revealFile: 'fta-reveal-file',
    revealFolder: 'fta-reveal-folder',
    vaultChange: 'fta-vault-change',
    createNewNote: 'fta-create-new-note',
};

export interface BookmarksPluginItem {
    type: 'file' | 'group' | 'search' | 'folder';
    ctime: number;
    path: string;
    title: string; // data-path from the element
    items: BookmarksPluginItem[];
}
