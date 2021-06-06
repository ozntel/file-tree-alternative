import { Plugin } from 'obsidian';
import { VIEW_TYPE, FileTreeView } from './FileTreeView';
import { FileTreeUtils } from './utils';

export default class FileTreeAlternativePlugin extends Plugin {

	addEventListener = () => FileTreeUtils.addEventListenerForFolders(this.app);

	async onload() {
		console.log('Loading Alternative File Tree Plugin');

		// Register View
		this.registerView(VIEW_TYPE, (leaf) => {
			return new FileTreeView(leaf, this);
		});

		// Event Listener for Folder Names in File Explorer
		if (this.app.workspace.layoutReady) {
			this.registerVaultEvent();
		} else {
			this.registerEvent(this.app.workspace.on('layout-ready', this.registerVaultEvent));
		}

		// Command to Open File Tree Leaf
		this.addCommand({
			id: 'open-file-tree-leaf',
			name: 'Open File Tree Leaf',
			callback: async () => {
				if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length == 0) {
					await this.app.workspace.getLeftLeaf(true).setViewState({ type: VIEW_TYPE });
				}
				this.app.workspace.revealLeaf(this.app.workspace.getLeavesOfType(VIEW_TYPE).first());
			},
		});
	}

	onunload() {
		console.log('Unloading Alternative File Tree Plugin');
	}

	registerVaultEvent = () => {
		FileTreeUtils.addEventListenerForFolders(this.app);
		this.registerEvent(this.app.vault.on('create', () => this.addEventListener()));
		this.registerEvent(this.app.vault.on('delete', () => this.addEventListener()));
		this.registerEvent(this.app.vault.on('rename', () => this.addEventListener()));
	}

}