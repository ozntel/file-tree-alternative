import { TFolder } from 'obsidian';

export interface FolderFileCountMap {
	[key: string]: number;
}

export interface FolderTree {
	folder: TFolder;
	children: FolderTree[];
}
