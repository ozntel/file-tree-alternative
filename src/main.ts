import { Plugin } from 'obsidian';
import { VIEW_TYPE, FileTreeView } from './FileTreeView';
import { FileTreeUtils } from './utils';

export default class FileTreeAlternativePlugin extends Plugin {

	async onload() {
		console.log('loading plugin');

		// Register View
		this.registerView(VIEW_TYPE, (leaf) => {
			return new FileTreeView(leaf, this);
		});

		// Event Listener for "nav-folder-title"
		if (this.app.workspace.layoutReady) {
			this.registerVaultEvent();
		} else {
			this.registerEvent(this.app.workspace.on('layout-ready', this.registerVaultEvent));
		}


		// Command to Open Tree Leaf
		this.addCommand({
			id: 'open-file-tree-leaf',
			name: 'Open File Tree Leaf',
			callback: async () => {
				if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length == 0) {
					await this.app.workspace.getRightLeaf(false).setViewState({ type: VIEW_TYPE });
				}
				this.app.workspace.revealLeaf(this.app.workspace.getLeavesOfType(VIEW_TYPE).first());
			},
		});
	}

	onunload() {
		console.log('unloading plugin');
	}

	registerVaultEvent = () => {
		FileTreeUtils.addEventListenerForFolders(this.app);
	}

}