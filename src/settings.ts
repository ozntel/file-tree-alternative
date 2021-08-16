import FileTreeAlternativePlugin from './main';
import { PluginSettingTab, Setting, App } from 'obsidian';

export interface FileTreeAlternativePluginSettings {
	ribbonIcon: boolean;
	showRootFolder: boolean;
	showFilesFromSubFolders: boolean;
	searchFunction: boolean;
	excludedExtensions: string;
	excludedFolders: string;
	folderCount: boolean;
	folderCountOption: string;
	openFolders: string[]; // Keeping the state of Open Folders - Not open for edit Manually
	pinnedFiles: string[]; // Keeping the state of Pinned Files - Not open for edit Manually
}

export const DEFAULT_SETTINGS: FileTreeAlternativePluginSettings = {
	ribbonIcon: true,
	showRootFolder: true,
	showFilesFromSubFolders: true,
	searchFunction: true,
	excludedExtensions: '',
	excludedFolders: '',
	folderCount: true,
	folderCountOption: 'notes',
	openFolders: [],
	pinnedFiles: [],
};

export class FileTreeAlternativePluginSettingsTab extends PluginSettingTab {
	plugin: FileTreeAlternativePlugin;

	constructor(app: App, plugin: FileTreeAlternativePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('h2', { text: 'General' });

		new Setting(containerEl)
			.setName('Ribbon Icon')
			.setDesc('Turn on if you want Ribbon Icon for activating the File Tree.')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.ribbonIcon).onChange((value) => {
					this.plugin.settings.ribbonIcon = value;
					this.plugin.saveSettings();
					this.plugin.refreshIconRibbon();
				})
			);

		new Setting(containerEl)
			.setName('Show Root Folder')
			.setDesc(
				`Turn on if you want your Root Folder "${this.plugin.app.vault.getName()}" to be visible in the file tree`
			)
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.showRootFolder).onChange((value) => {
					this.plugin.settings.showRootFolder = value;
					this.plugin.saveSettings();
					this.plugin.refreshTreeLeafs();
				})
			);

		new Setting(containerEl)
			.setName('Include Files From Subfolders to the File List')
			.setDesc(
				`Turn on this option if you want to see the list of files from all subfolders in addition to the selected folder`
			)
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.showFilesFromSubFolders).onChange((value) => {
					this.plugin.settings.showFilesFromSubFolders = value;
					this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName('Search in File List')
			.setDesc(`Turn on this option if you want to enable search function to filter files by name.`)
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.searchFunction).onChange((value) => {
					this.plugin.settings.searchFunction = value;
					this.plugin.saveSettings();
				})
			);

		containerEl.createEl('h2', { text: 'Folder Count Settings' });

		new Setting(containerEl)
			.setName('Folder Count')
			.setDesc('Turn on if you want see the number of notes/files under file tree.')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.folderCount).onChange((value) => {
					this.plugin.settings.folderCount = value;
					this.plugin.saveSettings();
					this.plugin.refreshTreeLeafs();
				})
			);

		new Setting(containerEl)
			.setName('Folder Count Details')
			.setDesc('Select which files you want to be included into count')
			.addDropdown((dropdown) => {
				dropdown.addOption('notes', 'Notes');
				dropdown.addOption('files', 'All Files');
				dropdown.setValue(this.plugin.settings.folderCountOption);
				dropdown.onChange((option) => {
					this.plugin.settings.folderCountOption = option;
					this.plugin.saveSettings();
					this.plugin.detachFileTreeLeafs();
					this.plugin.openFileTreeLeaf();
				});
			});

		containerEl.createEl('h2', { text: 'Exclude Settings' });

		new Setting(containerEl)
			.setName('Excluded File Extensions')
			.setDesc(
				`Provide extension of files, which you want to exclude from listing in file tree, divided by comma. i.e. 'png, pdf, jpeg'.
            You need to reload the vault to make changes effective.`
			)
			.addTextArea((text) =>
				text.setValue(this.plugin.settings.excludedExtensions).onChange((value) => {
					this.plugin.settings.excludedExtensions = value;
					this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName('Excluded Folder Paths')
			.setDesc(
				`Provide full path of folders, which you want to exclude from listing in file tree, divided by comma. i.e. 'Personal/Attachments, Work/Documents/Folders'.
            All subfolders are going to be excluded, as well. You need to reload the vault to make changes effective.`
			)
			.addTextArea((text) =>
				text.setValue(this.plugin.settings.excludedFolders).onChange((value) => {
					this.plugin.settings.excludedFolders = value;
					this.plugin.saveSettings();
				})
			);
	}
}
