import { TAbstractFile, TFile, TFolder } from 'obsidian';
import React, { useState, useEffect } from 'react';
import { FileComponent } from 'components/FileView/FileComponent';
import { FolderComponent } from 'components/FolderView/FolderComponent';
import { FileTreeView } from 'FileTreeView';
import FileTreeAlternativePlugin from 'main';
import * as FileTreeUtils from 'utils/Utils';
import { FolderTree, FolderFileCountMap } from 'utils/types';

interface MainTreeComponentProps {
	fileTreeView: FileTreeView;
	plugin: FileTreeAlternativePlugin;
}

export default function MainTreeComponent(props: MainTreeComponentProps) {
	// --> Main Variables
	const plugin: FileTreeAlternativePlugin = props.plugin;
	const rootFolder: TFolder = plugin.app.vault.getRoot();
	const excludedExtensions: string[] = getExcludedExtensions();

	// --> Register Event Handlers
	plugin.registerEvent(plugin.app.vault.on('rename', (file) => handleVaultChanges(file, 'rename')));
	plugin.registerEvent(plugin.app.vault.on('delete', (file) => handleVaultChanges(file, 'delete')));
	plugin.registerEvent(plugin.app.vault.on('create', (file) => handleVaultChanges(file, 'create')));

	// --> Plugin States
	const [view, setView] = useState<string>('folder');
	const [activeFolderPath, setActiveFolderPath] = useState<string>('');
	const [fileList, setFileList] = useState<TFile[]>([]);
	const [pinnedFiles, setPinnedFiles] = useState<TFile[]>(getPinnedFilesFromSettings());
	const [openFolders, setOpenFolders] = useState<TFolder[]>(getOpenFoldersFromSettings());
	const [folderTree, setFolderTree] = useState<FolderTree>(FileTreeUtils.createFolderTree(rootFolder));
	const [excludedFolders, setExcludedFolders] = useState<string[]>(getExcludedFolders());
	const [folderFileCountMap, setFolderFileCountMap] = useState<FolderFileCountMap>(
		plugin.settings.folderCount ? FileTreeUtils.getFolderNoteCountMap(plugin) : {}
	);

	const setNewFileList = (folderPath?: string) => {
		let filesPath = folderPath ? folderPath : activeFolderPath;
		setFileList(FileTreeUtils.getFilesUnderPath(filesPath, plugin));
	};

	// State Change Handlers
	useEffect(() => savePinnedFilesToSettings(), [pinnedFiles]);
	useEffect(() => saveOpenFoldersToSettings(), [openFolders]);
	useEffect(() => saveExcludedFoldersToSettings(), [excludedFolders]);

	// If activeFolderPath is set, it means it should go to 'file' view
	useEffect(() => {
		if (activeFolderPath !== '') {
			setNewFileList(activeFolderPath);
			setView('file');
		}
	}, [activeFolderPath]);

	// Load Excluded Extensions as State
	function getExcludedExtensions(): string[] {
		let extensionsString: string = plugin.settings.excludedExtensions;
		let excludedExtensions: string[] = [];
		for (let extension of extensionsString.split(',')) {
			excludedExtensions.push(extension.trim());
		}
		return excludedExtensions;
	}

	// Load Excluded Folders
	function getExcludedFolders(): string[] {
		let excludedString: string = plugin.settings.excludedFolders;
		let excludedFolders: string[] = [];
		for (let excludedFolder of excludedString.split(',')) {
			excludedFolders.push(excludedFolder.trim());
		}
		return excludedFolders;
	}

	// Load The String List and Set Open Folders State
	function getOpenFoldersFromSettings(): TFolder[] {
		let openFolders: TFolder[] = [];
		for (let folder of plugin.settings.openFolders) {
			let openFolder = plugin.app.vault.getAbstractFileByPath(folder);
			if (openFolder) openFolders.push(openFolder as TFolder);
		}
		return openFolders;
	}

	// Load The String List anad Set Pinned Files State
	function getPinnedFilesFromSettings(): TFile[] {
		let pinnedFiles: TFile[] = [];
		for (let file of plugin.settings.pinnedFiles) {
			let pinnedFile = plugin.app.vault.getAbstractFileByPath(file);
			if (pinnedFile) pinnedFiles.push(pinnedFile as TFile);
		}
		return pinnedFiles;
	}

	// Get The Folders State and Save in Data as String Array
	function saveOpenFoldersToSettings() {
		let openFoldersToSave: string[] = [];
		for (let folder of openFolders) {
			openFoldersToSave.push(folder.path);
		}
		plugin.settings.openFolders = openFoldersToSave;
		plugin.saveSettings();
	}

	// Get The Pinned Files State and Save in Data as String Array
	function savePinnedFilesToSettings() {
		let pinnedFilesToSave: string[] = [];
		for (let file of pinnedFiles) {
			pinnedFilesToSave.push(file.path);
		}
		plugin.settings.pinnedFiles = pinnedFilesToSave;
		plugin.saveSettings();
	}

	// Save Excluded Folders to Settings as String
	function saveExcludedFoldersToSettings() {
		plugin.settings.excludedFolders = excludedFolders.join(', ');
		plugin.saveSettings();
	}

	// Function for Event Handlers
	function handleVaultChanges(file: TAbstractFile, changeType: string) {
		if (file instanceof TFile) {
			if (view === 'file') {
				if (changeType === 'rename' || changeType === 'delete') {
					// If the file renamed and deleted is in the current view, it will be updated
					if (fileList.some((stateFile) => stateFile.path === file.path)) setNewFileList();
				} else if (changeType === 'create') {
					if (file.path.match(new RegExp(activeFolderPath + '.*'))) setNewFileList();
				}
			}
		} else if (file instanceof TFolder) {
			setFolderTree(FileTreeUtils.createFolderTree(rootFolder));
		}
		// After Each Vault Change Folder Count Map to Be Updated
		if (plugin.settings.folderCount) setFolderFileCountMap(FileTreeUtils.getFolderNoteCountMap(plugin));
	}

	return (
		<React.Fragment>
			{view === 'folder' ? (
				<FolderComponent
					plugin={plugin}
					folderTree={folderTree}
					activeFolderPath={activeFolderPath}
					setActiveFolderPath={setActiveFolderPath}
					setView={setView}
					openFolders={openFolders}
					setOpenFolders={setOpenFolders}
					excludedFolders={excludedFolders}
					setExcludedFolders={setExcludedFolders}
					folderFileCountMap={folderFileCountMap}
				/>
			) : (
				<FileComponent
					plugin={plugin}
					fileList={fileList}
					setFileList={setFileList}
					getFilesUnderPath={FileTreeUtils.getFilesUnderPath}
					activeFolderPath={activeFolderPath}
					setView={setView}
					pinnedFiles={pinnedFiles}
					setPinnedFiles={setPinnedFiles}
					excludedExtensions={excludedExtensions}
				/>
			)}
		</React.Fragment>
	);
}
