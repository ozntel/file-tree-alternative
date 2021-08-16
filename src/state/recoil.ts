import { atom } from 'recoil';
import { TFile, TFolder } from 'obsidian';
import { FolderTree, FolderFileCountMap } from './types';

export const viewState = atom({ key: 'view', default: 'folder' });
export const activeFolderPathState = atom({ key: 'activeFolderPath', default: '' as string });
export const fileListState = atom({ key: 'fileList', default: [] as TFile[] });
export const pinnedFilesState = atom({ key: 'pinnedFiles', default: [] as TFile[] });
export const openFoldersState = atom({ key: 'openFolders', default: [] as TFolder[] });
export const folderTreeState = atom({ key: 'folderTree', default: {} as FolderTree });
export const excludedExtensionsState = atom({ key: 'excludedExtensions', default: [] as string[] });
export const excludedFoldersState = atom({ key: 'excludedFolders', default: [] as string[] });
export const folderFileCountMapState = atom({ key: 'folderFileCountMap', default: {} as FolderFileCountMap });
