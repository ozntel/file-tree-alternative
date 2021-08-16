import { App, TAbstractFile, TFile, TFolder } from 'obsidian';
import React from 'react';
import { FileComponent } from './FileComponent';
import { FolderComponent } from './FolderComponent';
import { FileTreeView } from '../FileTreeView';
import FileTreeAlternativePlugin from '../main';

interface MainTreeComponentProps {
	fileTreeView: FileTreeView;
	plugin: FileTreeAlternativePlugin;
}

interface MainTreeComponentState {
	view: string;
	activeFolderPath: string;
	fileList: TFile[];
	pinnedFiles: TFile[];
	openFolders: TFolder[];
	folderTree: FolderTree;
	excludedExtensions: string[];
	excludedFolders: string[];
	folderFileCountMap: { [key: string]: number };
}

export interface FolderTree {
	folder: TFolder;
	children: FolderTree[];
}

export default class MainTreeComponent extends React.Component<MainTreeComponentProps, MainTreeComponentState> {
	state = {
		view: 'folder',
		activeFolderPath: '',
		fileList: [] as TFile[],
		pinnedFiles: [] as TFile[],
		openFolders: [] as TFolder[],
		folderTree: null as FolderTree,
		excludedExtensions: [] as string[],
		excludedFolders: [] as string[],
		folderFileCountMap: {},
	};

	rootFolder: TFolder = this.props.plugin.app.vault.getRoot();

	setView = (view: string) => this.setState({ view });

	setPinnedFiles = (pinnedFiles: TFile[]) => {
		this.setState({ pinnedFiles });
		this.savePinnedFilesToSettings();
	};

	setFileList = (fileList: TFile[]) => {
		this.setState({ fileList });
	};

	setNewFileList = (folderPath?: string) => {
		let filesPath = folderPath ? folderPath : this.state.activeFolderPath;
		this.setState({ fileList: getFilesUnderPath(filesPath, this.props.plugin) });
	};

	// Folder Component to Set Expanded Folders
	setOpenFolders = (openFolders: TFolder[]) => {
		this.setState({ openFolders });
	};

	// Function used for File View
	setActiveFolderPath = (activeFolderPath: string) => {
		// If activeFolderPath is set, it means it should go to 'file' view
		this.setState({ activeFolderPath: activeFolderPath });
		this.setNewFileList(activeFolderPath);
		this.setState({ view: 'file' });
	};

	// Load Excluded Extensions as State
	loadExcludedExtensions = () => {
		let extensionsString: string = this.props.plugin.settings.excludedExtensions;
		let excludedExtensions: string[] = [];
		for (let extension of extensionsString.split(',')) {
			excludedExtensions.push(extension.trim());
		}
		this.setState({ excludedExtensions });
	};

	// Load Excluded Folders
	loadExcludedFolders = () => {
		let excludedString: string = this.props.plugin.settings.excludedFolders;
		let excludedFolders: string[] = [];
		for (let excludedFolder of excludedString.split(',')) {
			excludedFolders.push(excludedFolder.trim());
		}
		this.setState({ excludedFolders });
	};

	// Load The String List and Set Open Folders State
	loadOpenFoldersFromSettings() {
		let openFolders: TFolder[] = [];
		for (let folder of this.props.plugin.settings.openFolders) {
			let openFolder = this.props.plugin.app.vault.getAbstractFileByPath(folder);
			if (openFolder) openFolders.push(openFolder as TFolder);
		}
		this.setState({ openFolders });
	}

	// Load The String List anad Set Pinned Files State
	loadPinnedFilesFromSettings() {
		let pinnedFiles: TFile[] = [];
		for (let file of this.props.plugin.settings.pinnedFiles) {
			let pinnedFile = this.props.plugin.app.vault.getAbstractFileByPath(file);
			if (pinnedFile) pinnedFiles.push(pinnedFile as TFile);
		}
		this.setState({ pinnedFiles });
	}

	// Get The Folders State and Save in Data as String Array
	saveOpenFoldersToSettings() {
		let openFolders: string[] = [];
		for (let folder of this.state.openFolders) {
			openFolders.push(folder.path);
		}
		this.props.plugin.settings.openFolders = openFolders;
		this.props.plugin.saveSettings();
	}

	// Get The Pinned Files State and Save in Data as String Array
	savePinnedFilesToSettings() {
		let pinnedFiles: string[] = [];
		for (let file of this.state.pinnedFiles) {
			pinnedFiles.push(file.path);
		}
		this.props.plugin.settings.pinnedFiles = pinnedFiles;
		this.props.plugin.saveSettings();
	}

	// Save Excluded Folders to Settings as String
	saveExcludedFoldersToSettings() {
		this.props.plugin.settings.excludedFolders = this.state.excludedFolders.join(', ');
		this.props.plugin.saveSettings();
	}

	// Set New Excluded Folders List and Save to Settings
	setExcludedFolders = (excludedFolders: string[]) => {
		this.setState({ excludedFolders });
		this.saveExcludedFoldersToSettings();
	};

	// First Time Compount Mount
	componentDidMount() {
		console.log('File Tree Component Mounted');
		// Set the Folder Tree and Folder Count Map
		this.setState({ folderTree: createFolderTree(this.rootFolder) });
		if (this.props.plugin.settings.folderCount)
			this.setState({ folderFileCountMap: getFolderNoteCountMap(this.props.plugin) });
		// Set/Remember Open Folders from Last Session
		this.loadOpenFoldersFromSettings();
		// Set/Remember Pinned Files
		this.loadPinnedFilesFromSettings();
		// Set Excluded File Extensions
		this.loadExcludedExtensions();
		// Set Excluded Folders
		this.loadExcludedFolders();
		// Register Vault Events
		this.props.plugin.registerEvent(
			this.props.plugin.app.vault.on('rename', (file, oldPath) => this.handleVaultChanges(file, 'rename'))
		);
		this.props.plugin.registerEvent(
			this.props.plugin.app.vault.on('delete', (file) => this.handleVaultChanges(file, 'delete'))
		);
		this.props.plugin.registerEvent(
			this.props.plugin.app.vault.on('create', (file) => this.handleVaultChanges(file, 'create'))
		);
		// Workspace Quit to Save Last Status of Open Folders
		this.props.plugin.registerEvent(
			this.props.plugin.app.workspace.on('quit', () => {
				this.saveOpenFoldersToSettings();
				this.savePinnedFilesToSettings();
			})
		);
	}

	// Before Compount Unmounted Save Last States
	componentWillUnmount = () => {
		this.saveOpenFoldersToSettings();
		this.savePinnedFilesToSettings();
	};

	// Function for Event Handlers
	handleVaultChanges = (file: TAbstractFile, changeType: string) => {
		if (file instanceof TFile) {
			if (this.state.view === 'file') {
				if (changeType === 'rename' || changeType === 'delete') {
					// If the file renamed and deleted is in the current view, it will be updated
					if (this.state.fileList.some((stateFile) => stateFile.path === file.path)) {
						this.setNewFileList();
					}
				} else if (changeType === 'create') {
					if (file.path.match(new RegExp(this.state.activeFolderPath + '.*'))) {
						this.setNewFileList();
					}
				}
			}
		} else if (file instanceof TFolder) {
			this.setState({ folderTree: createFolderTree(this.rootFolder) });
		}
		// After Each Vault Change Folder Count Map to Be Updated
		if (this.props.plugin.settings.folderCount)
			this.setState({ folderFileCountMap: getFolderNoteCountMap(this.props.plugin) });
	};

	render() {
		return (
			<React.Fragment>
				{this.state.view === 'folder' ? (
					<FolderComponent
						plugin={this.props.plugin}
						folderTree={this.state.folderTree}
						activeFolderPath={this.state.activeFolderPath}
						setActiveFolderPath={this.setActiveFolderPath}
						setView={this.setView}
						openFolders={this.state.openFolders}
						setOpenFolders={this.setOpenFolders}
						excludedFolders={this.state.excludedFolders}
						setExcludedFolders={this.setExcludedFolders}
						folderFileCountMap={this.state.folderFileCountMap}
					/>
				) : (
					<FileComponent
						plugin={this.props.plugin}
						fileList={this.state.fileList}
						setFileList={this.setFileList}
						getFilesUnderPath={getFilesUnderPath}
						activeFolderPath={this.state.activeFolderPath}
						setView={this.setView}
						pinnedFiles={this.state.pinnedFiles}
						setPinnedFiles={this.setPinnedFiles}
						excludedExtensions={this.state.excludedExtensions}
					/>
				)}
			</React.Fragment>
		);
	}
}

// Helper Function To Get List of Files
const getFilesUnderPath = (path: string, plugin: FileTreeAlternativePlugin, getAllFiles?: boolean): TFile[] => {
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
const createFolderTree = (startFolder: TFolder) => {
	const fileTree: { folder: TFolder; children: any } = { folder: startFolder, children: [] };
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
const getFolderNoteCountMap = (plugin: FileTreeAlternativePlugin) => {
	const counts: { [key: string]: number } = {};
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
