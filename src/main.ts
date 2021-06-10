import { Plugin } from 'obsidian';
import { VIEW_TYPE, FileTreeView, ICON } from './FileTreeView';
import {
	FileTreeAlternativePluginSettings,
	FileTreeAlternativePluginSettingsTab, DEFAULT_SETTINGS
} from './settings';

export default class FileTreeAlternativePlugin extends Plugin {

	settings: FileTreeAlternativePluginSettings;
	ribbonIconEl: HTMLElement | undefined = undefined;

	async onload() {
		console.log('Loading Alternative File Tree Plugin');

		// Load Settings
		this.addSettingTab(new FileTreeAlternativePluginSettingsTab(this.app, this));
		await this.loadSettings();

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
		this.refreshIconRibbon();
	}

	onunload() {
		console.log('Unloading Alternative File Tree Plugin');
		this.detachFileTreeLeafs();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	refreshIconRibbon = () => {
		this.ribbonIconEl?.remove();
		if (this.settings.ribbonIcon) {
			this.ribbonIconEl = this.addRibbonIcon(ICON, 'Alternative File Tree Plugin', async () => {
				await this.openFileTreeLeaf()
			});;
		}
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