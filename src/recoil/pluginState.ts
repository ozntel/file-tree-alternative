import { TFile, TFolder } from 'obsidian';
import { atom } from 'recoil';
import { FolderTree, FolderFileCountMap, OZFile } from 'utils/types';

export const view = atom({
    key: 'fileTreeViewState',
    default: 'folder',
});

export const activeFolderPath = atom({
    key: 'fileTreeActiveFolderPathState',
    default: '',
});

export const activeOZFile = atom({
    key: 'fileTreeActiveOZFile',
    default: null as OZFile,
});

export const excludedFolders = atom({
    key: 'fileTreeExcludedFoldersState',
    default: [] as string[],
});

export const excludedExtensions = atom({
    key: 'fileTreeExcludedExtensions',
    default: [] as string[],
});

export const folderFileCountMap = atom({
    key: 'fileTreeFolderFileCountMapState',
    default: {} as FolderFileCountMap,
});

export const folderTree = atom({
    key: 'fileTreeFolderTreeState',
    default: null as FolderTree,
    dangerouslyAllowMutability: true,
});

export const ozFileList = atom({
    key: 'fileTreeOzFileListState',
    default: [] as OZFile[],
});

export const ozPinnedFileList = atom({
    key: 'fileTreeOzPinnedFilesState',
    default: [] as OZFile[],
});

export const openFolders = atom({
    key: 'fileTreeOpenFoldersState',
    default: [] as string[],
});

export const showSubFolders = atom({
    key: 'showSubFoldersInVault',
    default: false,
});

export const focusedFolder = atom({
    key: 'fileTreeFocusedFolder',
    default: null as TFolder,
    dangerouslyAllowMutability: true,
});
