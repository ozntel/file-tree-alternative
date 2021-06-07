import { Plugin } from 'obsidian';
import { VIEW_TYPE, FileTreeView } from './FileTreeView';
import { FileTreeUtils } from './utils';

export default class FileTreeAlternativePlugin extends Plugin {

	async onload() {
		console.log('Loading Alternative File Tree Plugin');

		// Register File Tree View
		this.registerView(VIEW_TYPE, (leaf) => {
			return new FileTreeView(leaf, this);
		});

		// Add Leaf for File Tree
		await this.openFileTreeLeaf();

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
			callback: async () => await this.openFileTreeLeaf(),
		});
	}

	onunload() {
		console.log('Unloading Alternative File Tree Plugin');
		FileTreeUtils.removeEventListenerForFolders(this.app);
	}

	openFileTreeLeaf = async () => {
		if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length == 0) {
			await this.app.workspace.getLeftLeaf(true).setViewState({ type: VIEW_TYPE });
		}
		this.app.workspace.revealLeaf(this.app.workspace.getLeavesOfType(VIEW_TYPE).first());
	}

	registerVaultEvent = () => {
		FileTreeUtils.initialCheckForSubFolders(this.app);
		FileTreeUtils.addEventListenerForFolders(this.app);
		this.registerEvent(this.app.vault.on('create', (file) => FileTreeUtils.setFileTreeFiles(file.parent.path, this.app, true)));
		this.registerEvent(this.app.vault.on('delete', (file) => FileTreeUtils.setFileTreeFiles(file.parent.path, this.app, true)));
		this.registerEvent(this.app.vault.on('rename', (file) => FileTreeUtils.setFileTreeFiles(file.parent.path, this.app, true)));
	}

}