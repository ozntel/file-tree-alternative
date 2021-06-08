import { Plugin } from 'obsidian';
import { VIEW_TYPE, FileTreeView, ICON } from './FileTreeView';
import { FileTreeUtils } from './utils';

export default class FileTreeAlternativePlugin extends Plugin {

	FolderClickEventHolder: Function;

	async onload() {
		console.log('Loading Alternative File Tree Plugin');

		// Register File Tree View
		this.registerView(VIEW_TYPE, (leaf) => {
			return new FileTreeView(leaf, this);
		});

		// Event Listeners 
		this.app.workspace.onLayoutReady(() => this.registerVaultEvent())

		// Add Command to Open File Tree Leaf
		this.addCommand({
			id: 'open-file-tree-leaf',
			name: 'Open File Tree Leaf',
			callback: async () => await FileTreeUtils.openFileTreeLeaf(this.app),
		});

		// Ribbon Icon For Opening 
		this.addRibbonIcon(ICON, 'Alternative File Tree Plugin', async () => {
			await FileTreeUtils.openFileTreeLeaf(this.app)
		});
	}

	onunload() {
		console.log('Unloading Alternative File Tree Plugin');
		this.removeEventListenerForFolders();
		FileTreeUtils.detachFileTreeLeafs(this.app);
	}

	// Load Functions and Event Listeners
	registerVaultEvent = async () => {
		// Initial Check for Sub-Folders
		FileTreeUtils.initialCheckForSubFolders(this.app);
		// Click Event
		this.addEventListenerForFolders();
		// Vault Events
		this.registerEvent(this.app.vault.on('create', (file) => FileTreeUtils.setFileTreeFiles(file.parent.path, this.app, 'create')));
		this.registerEvent(this.app.vault.on('delete', (file) => FileTreeUtils.setFileTreeFiles('', this.app, 'delete')));
		this.registerEvent(this.app.vault.on('rename', (file, oldPath) => {
			FileTreeUtils.handleRenameFolder(file, oldPath);
			FileTreeUtils.setFileTreeFiles(file.parent.path, this.app, 'rename');
		}));
		// Add Leaf for File Tree
		await FileTreeUtils.openFileTreeLeaf(this.app);
	}

	// Click Event Function
	folderClickEvent = (event: MouseEvent, navFolderTitleEl: HTMLElement) => {
		FileTreeUtils.setFileTreeFiles(navFolderTitleEl.getAttr('data-path'), this.app, '');
	}

	// Add Click Event Listener
	addEventListenerForFolders = () => {
		document.body.on("click", FileTreeUtils.folderSelector, this.folderClickEvent);
		this.FolderClickEventHolder = this.folderClickEvent;
	};

	// Remove Click Event Listener
	removeEventListenerForFolders = () => {
		// @ts-ignore
		document.body.off("click", FileTreeUtils.folderSelector, this.FolderClickEventHolder)
	};

}