import { TFile, TFolder } from 'obsidian';
import { atom } from 'recoil';
import { FolderTree, FolderFileCountMap } from 'utils/types';

export const viewState = atom({
	key: 'fileTreeViewState',
	default: 'folder',
});

export const activeFolderPathState = atom({
	key: 'fileTreeActiveFolderPathState',
	default: '',
});

export const excludedFoldersState = atom({
	key: 'fileTreeExcludedFoldersState',
	default: [] as string[],
});

export const excludedExtensionsState = atom({
	key: 'fileTreeExcludedExtensions',
	default: [] as string[],
});

export const folderFileCountMapState = atom({
	key: 'fileTreeFolderFileCountMapState',
	default: {} as FolderFileCountMap,
});

export const folderTreeState = atom({
	key: 'fileTreeFolderTreeState',
	default: null as FolderTree,
	dangerouslyAllowMutability: true,
});

export const fileListState = atom({
	key: 'fileTreeFileListState',
	default: [] as TFile[],
	dangerouslyAllowMutability: true,
});

export const pinnedFilesState = atom({
	key: 'fileTreePinnedFilesState',
	default: [] as TFile[],
	dangerouslyAllowMutability: true,
});

export const openFoldersState = atom({
	key: 'fileTreeOpenFoldersState',
	default: [] as TFolder[],
	dangerouslyAllowMutability: true,
});
