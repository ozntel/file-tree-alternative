import FileTreeAlternativePlugin from "./main";
import { PluginSettingTab, Setting, App } from 'obsidian';

export interface FileTreeAlternativePluginSettings {
    ribbonIcon: boolean;
    excludedExtensions: string;
    excludedFolders: string;
    folderCount: boolean;
    openFolders: string[]; // Keeping the state of Open Folders - Not open for edit Manually
    pinnedFiles: string[]; // Keeping the state of Pinned Files - Not open for edit Manually
}

export const DEFAULT_SETTINGS: FileTreeAlternativePluginSettings = {
    ribbonIcon: true,
    excludedExtensions: '',
    excludedFolders: '',
    folderCount: true,
    openFolders: [],
    pinnedFiles: []
}

export class FileTreeAlternativePluginSettingsTab extends PluginSettingTab {

    plugin: FileTreeAlternativePlugin;

    constructor(app: App, plugin: FileTreeAlternativePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {

        let { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: "File Tree Alternative Settings" });

        new Setting(containerEl)
            .setName('Ribbon Icon')
            .setDesc('Turn on if you want Ribbon Icon for clearing the images.')
            .addToggle((toggle) => toggle
                .setValue(this.plugin.settings.ribbonIcon)
                .onChange((value) => {
                    this.plugin.settings.ribbonIcon = value;
                    this.plugin.saveSettings();
                    this.plugin.refreshIconRibbon();
                })
            )

        new Setting(containerEl)
            .setName('Folder Note Count')
            .setDesc('Turn on if you want see the number of notes under file tree.')
            .addToggle((toggle) => toggle
                .setValue(this.plugin.settings.folderCount)
                .onChange((value) => {
                    this.plugin.settings.folderCount = value;
                    this.plugin.saveSettings();
                    this.plugin.detachFileTreeLeafs();
                    this.plugin.openFileTreeLeaf();
                })
            )

        new Setting(containerEl)
            .setName('Excluded File Extensions')
            .setDesc(`Provide extension of files, which you want to exclude from listing in file tree, divided by comma. i.e. 'png, pdf, jpeg'.
            You need to reload the vault to make changes effective.`)
            .addTextArea((text) => text
                .setValue(this.plugin.settings.excludedExtensions)
                .onChange((value) => {
                    this.plugin.settings.excludedExtensions = value;
                    this.plugin.saveSettings();
                })
            )

        new Setting(containerEl)
            .setName('Excluded Folder Paths')
            .setDesc(`Provide full path of folders, which you want to exclude from listing in file tree, divided by comma. i.e. 'Personal/Attachments, Work/Documents/Folders'.
            All subfolders are going to be excluded, as well. You need to reload the vault to make changes effective.`)
            .addTextArea((text) => text
                .setValue(this.plugin.settings.excludedFolders)
                .onChange((value) => {
                    this.plugin.settings.excludedFolders = value;
                    this.plugin.saveSettings();
                })
            )

    }

}