import { TFile, TFolder, App } from 'obsidian';
import FileTreeAlternativePlugin from 'main';
import { FolderFileCountMap, FolderTree } from 'utils/types';

// Helper Function To Get List of Files
export const getFilesUnderPath = (path: string, plugin: FileTreeAlternativePlugin, getAllFiles?: boolean): TFile[] => {
	var filesUnderPath: TFile[] = [];
	var showFilesFromSubFolders = getAllFiles ? true : plugin.settings.showFilesFromSubFolders;
	recursiveFx(path, plugin.app);
	function recursiveFx(path: string, app: App) {
		var folderObj = app.vault.getAbstractFileByPath(path);
		if (folderObj instanceof TFolder && folderObj.children) {
			for (let child of folderObj.children) {
				if (child instanceof TFile) filesUnderPath.push(child);
				if (child instanceof TFolder && showFilesFromSubFolders) recursiveFx(child.path, app);
			}
		}
	}
	return filesUnderPath;
};

// Helper Function to Create Folder Tree
export const createFolderTree = (startFolder: TFolder): FolderTree => {
	let fileTree: { folder: TFolder; children: any } = { folder: startFolder, children: [] };
	function recursive(folder: TFolder, object: { folder: TFolder; children: any }) {
		for (let child of folder.children) {
			if (child instanceof TFolder) {
				let childFolder: TFolder = child as TFolder;
				let newObj: { folder: TFolder; children: any } = { folder: childFolder, children: [] };
				object.children.push(newObj);
				if (childFolder.children) recursive(childFolder, newObj);
			}
		}
	}
	recursive(startFolder, fileTree);
	return fileTree;
};

// Create Folder File Count Map
export const getFolderNoteCountMap = (plugin: FileTreeAlternativePlugin) => {
	const counts: FolderFileCountMap = {};
	let files: TFile[];
	if (plugin.settings.folderCountOption === 'notes') {
		files = plugin.app.vault.getMarkdownFiles();
	} else {
		files = plugin.app.vault.getFiles();
	}

	files.forEach((file) => {
		for (let folder = file.parent; folder != null; folder = folder.parent) {
			counts[folder.path] = 1 + (counts[folder.path] || 0);
		}
	});
	return counts;
};

// Files out of Md should be listed with extension badge - Md without extension
export const getFileNameAndExtension = (fullName: string) => {
	var index = fullName.lastIndexOf('.');
	return {
		fileName: fullName.substring(0, index),
		extension: fullName.substring(index + 1),
	};
};

// Extracts the Folder Name from the Full Folder Path
export const getFolderName = (folderPath: string, app: App) => {
	if (folderPath === '/') return app.vault.getName();
	let index = folderPath.lastIndexOf('/');
	if (index !== -1) return folderPath.substring(index + 1);
	return folderPath;
};

export const internalPluginLoaded = (pluginName: string, app: App) => {
	// @ts-ignore
	return app.internalPlugins.plugins[pluginName]?._loaded;
};
