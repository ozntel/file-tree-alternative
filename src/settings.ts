import FileTreeAlternativePlugin from "./main";
import { PluginSettingTab, Setting, App } from 'obsidian';

export interface FileTreeAlternativePluginSettings {
    ribbonIcon: boolean;
    openFolders: string[]; // Keeping the state of Open Folders - Not open for edit Manually
    pinnedFiles: string[]; // Keeping the state of Pinned Files - Not open for edit Manually
}

export const DEFAULT_SETTINGS: FileTreeAlternativePluginSettings = {
    ribbonIcon: true,
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

    }

}