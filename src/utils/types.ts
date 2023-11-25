import { TFolder, TFile } from 'obsidian';

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
    vaultChange: 'fta-vault-change',
    createNewNote: 'fta-create-new-note',
};
