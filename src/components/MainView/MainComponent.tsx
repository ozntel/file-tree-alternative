import { TAbstractFile, TFile, TFolder } from 'obsidian';
import React, { useEffect } from 'react';
import { FileComponent } from 'components/FileView/FileComponent';
import { MainFolder } from 'components/FolderView/MainFolder';
import { FileTreeView } from 'FileTreeView';
import FileTreeAlternativePlugin from 'main';
import * as FileTreeUtils from 'utils/Utils';
import * as recoilState from '../../recoil/pluginState';
import { useRecoilState } from 'recoil';

interface MainTreeComponentProps {
	fileTreeView: FileTreeView;
	plugin: FileTreeAlternativePlugin;
}

export default function MainTreeComponent(props: MainTreeComponentProps) {
	// --> Main Variables
	const plugin: FileTreeAlternativePlugin = props.plugin;
	const rootFolder: TFolder = plugin.app.vault.getRoot();

	// --> Register Event Handlers
	plugin.registerEvent(plugin.app.vault.on('rename', (file, oldPath) => handleVaultChanges(file, 'rename', oldPath)));
	plugin.registerEvent(plugin.app.vault.on('delete', (file) => handleVaultChanges(file, 'delete')));
	plugin.registerEvent(plugin.app.vault.on('create', (file) => handleVaultChanges(file, 'create')));

	// --> Plugin States
	const [view, setView] = useRecoilState(recoilState.view);
	const [activeFolderPath, setActiveFolderPath] = useRecoilState(recoilState.activeFolderPath);
	const [fileList, setFileList] = useRecoilState(recoilState.fileList);
	const [pinnedFiles, setPinnedFiles] = useRecoilState(recoilState.pinnedFiles);
	const [openFolders, setOpenFolders] = useRecoilState(recoilState.openFolders);
	const [folderTree, setFolderTree] = useRecoilState(recoilState.folderTree);
	const [excludedFolders, setExcludedFolders] = useRecoilState(recoilState.excludedFolders);
	const [folderFileCountMap, setFolderFileCountMap] = useRecoilState(recoilState.folderFileCountMap);
	const [excludedExtensions, setExcludedExtensions] = useRecoilState(recoilState.excludedExtensions);

	const setNewFileList = (folderPath?: string) => {
		let filesPath = folderPath ? folderPath : activeFolderPath;
		setFileList(FileTreeUtils.getFilesUnderPath(filesPath, plugin));
	};

	// Initial Load
	useEffect(() => {
		setExcludedFolders(getExcludedFolders());
		setExcludedExtensions(getExcludedExtensions());
		setPinnedFiles(getPinnedFilesFromSettings());
		setOpenFolders(getOpenFoldersFromSettings());
		if (plugin.settings.folderCount) setFolderFileCountMap(FileTreeUtils.getFolderNoteCountMap(plugin));
		setFolderTree(FileTreeUtils.createFolderTree(rootFolder));
	}, []);

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
	function handleVaultChanges(file: TAbstractFile, changeType: string, oldPathBeforeRename?: string) {
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
			// if active folder is renamed, activefolderpath needs to be refreshed
			if (changeType === 'rename' && oldPathBeforeRename && activeFolderPath === oldPathBeforeRename) {
				setActiveFolderPath(file.path);
			}
		}
		// After Each Vault Change Folder Count Map to Be Updated
		if (plugin.settings.folderCount) setFolderFileCountMap(FileTreeUtils.getFolderNoteCountMap(plugin));
	}

	return (
		<React.Fragment>
			{view === 'folder' ? (
				<MainFolder plugin={plugin} />
			) : plugin.settings.evernoteView ? (
				<SingleView plugin={plugin} />
			) : (
				<FileComponent plugin={plugin} />
			)}
		</React.Fragment>
	);
}

const SingleView = (props: { plugin: FileTreeAlternativePlugin }) => {
	return (
		<div className="file-tree-container">
			<div className="oz-folder-pane">
				<MainFolder plugin={props.plugin} />
			</div>
			<div id="file-tree-divider"></div>
			<div className="oz-file-list-pane">
				<FileComponent plugin={props.plugin} />
			</div>
		</div>
	);
};
