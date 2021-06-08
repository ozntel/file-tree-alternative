import { Plugin } from 'obsidian';
import { VIEW_TYPE, FileTreeView, ICON } from './FileTreeView';
import { FileTreeUtils } from './utils';

export default class FileTreeAlternativePlugin extends Plugin {

	async onload() {
		console.log('Loading Alternative File Tree Plugin');

		// Register File Tree View
		this.registerView(VIEW_TYPE, (leaf) => {
			return new FileTreeView(leaf, this);
		});

		// Event Listeners 
		if (this.app.workspace.layoutReady) {
			this.registerVaultEvent();
		} else {
			this.registerEvent(this.app.workspace.on('layout-ready', () => {
				this.registerVaultEvent()
			}));
		}

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
		FileTreeUtils.removeEventListenerForFolders(this.app);
	}

	// Load Functions and Event Listeners
	registerVaultEvent = async () => {
		// Initial Check for Sub-Folders
		FileTreeUtils.initialCheckForSubFolders(this.app);
		// Click Event
		FileTreeUtils.addEventListenerForFolders(this.app);
		// Vault Events
		this.registerEvent(this.app.vault.on('create', (file) => FileTreeUtils.setFileTreeFiles(file.parent.path, this.app, true)));
		this.registerEvent(this.app.vault.on('delete', (file) => FileTreeUtils.setFileTreeFiles(file.parent.path, this.app, true)));
		this.registerEvent(this.app.vault.on('rename', (file, oldPath) => {
			FileTreeUtils.handleRenameFolder(file, oldPath);
			FileTreeUtils.setFileTreeFiles(file.parent.path, this.app, true);
		}));
		// Add Leaf for File Tree
		await FileTreeUtils.openFileTreeLeaf(this.app);
	}

}