import { TFolder } from 'obsidian';

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
