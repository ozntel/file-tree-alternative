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
		this.app.workspace.onLayoutReady(async () => await this.openFileTreeLeaf())

		// Add Command to Open File Tree Leaf
		this.addCommand({
			id: 'open-file-tree-leaf',
			name: 'Open File Tree Leaf',
			callback: async () => await this.openFileTreeLeaf(),
		});

		// Ribbon Icon For Opening 
		this.addRibbonIcon(ICON, 'Alternative File Tree Plugin', async () => {
			await this.openFileTreeLeaf()
		});
	}

	onunload() {
		console.log('Unloading Alternative File Tree Plugin');
		this.detachFileTreeLeafs();
	}

	openFileTreeLeaf = async () => {
		if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length == 0) {
			let leaf = this.app.workspace.getLeftLeaf(false);
			await leaf.setViewState({ type: VIEW_TYPE });
			this.app.workspace.revealLeaf(leaf);
		}
	}

	detachFileTreeLeafs = () => {
		let leafs = this.app.workspace.getLeavesOfType(VIEW_TYPE);
		for (let leaf of leafs) {
			leaf.detach()
		}
	}

}