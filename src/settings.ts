import FileTreeAlternativePlugin from './main';
import { PluginSettingTab, Setting, App } from 'obsidian';

export interface FileTreeAlternativePluginSettings {
    ribbonIcon: boolean;
    showRootFolder: boolean;
    showFilesFromSubFolders: boolean;
    searchFunction: boolean;
    showFilesFromSubFoldersButton: boolean;
    excludedExtensions: string;
    excludedFolders: string;
    folderCount: boolean;
    folderCountOption: string;
    openFolders: string[]; // Keeping the state of Open Folders - Not open for edit Manually
    pinnedFiles: string[]; // Keeping the state of Pinned Files - Not open for edit Manually
    customHeight: number;
    evernoteView: boolean;
    filePreviewOnHover: boolean;
    sortFilesBy: 'name' | 'last-update';
    fixedHeaderInFileList: boolean;
    activeFolderPath: string; // Keeping the state of Active Folder Path - Not open for edit Manually
}

export const DEFAULT_SETTINGS: FileTreeAlternativePluginSettings = {
    ribbonIcon: true,
    showRootFolder: true,
    showFilesFromSubFolders: true,
    searchFunction: true,
    showFilesFromSubFoldersButton: true,
    excludedExtensions: '',
    excludedFolders: '',
    folderCount: true,
    folderCountOption: 'notes',
    openFolders: [], // Keeping the state of Open Folders - Not open for edit Manually
    pinnedFiles: [], // Keeping the state of Pinned Files - Not open for edit Manually
    customHeight: 0,
    evernoteView: true,
    filePreviewOnHover: false,
    sortFilesBy: 'name',
    fixedHeaderInFileList: false,
    activeFolderPath: '', // Keeping the state of Active Folder Path - Not open for edit Manually
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

        /* ------------- Buy Me a Coffee ------------- */

        const coffeeDiv = containerEl.createDiv('coffee');
        coffeeDiv.addClass('oz-coffee-div');
        const coffeeLink = coffeeDiv.createEl('a', { href: 'https://ko-fi.com/L3L356V6Q' });
        const coffeeImg = coffeeLink.createEl('img', {
            attr: {
                src: 'https://cdn.ko-fi.com/cdn/kofi2.png?v=3',
            },
        });
        coffeeImg.height = 40;

        /* ------------- General Settings ------------- */

        containerEl.createEl('h2', { text: 'General' });

        new Setting(containerEl)
            .setName('Evernote View')
            .setDesc('Turn on if you want to see the folders and files in a single view without switching between views. Similar experience to Evernote.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.evernoteView).onChange((value) => {
                    this.plugin.settings.evernoteView = value;
                    this.plugin.saveSettings();
                    this.plugin.refreshTreeLeafs();
                })
            );

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

        /* ------------- Folder Pane Settings ------------- */

        containerEl.createEl('h2', { text: 'Folder Pane Settings' });

        new Setting(containerEl)
            .setName('Show Root Folder')
            .setDesc(`Turn on if you want your Root Folder "${this.plugin.app.vault.getName()}" to be visible in the file tree`)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.showRootFolder).onChange((value) => {
                    this.plugin.settings.showRootFolder = value;
                    this.plugin.saveSettings();
                    this.plugin.refreshTreeLeafs();
                })
            );

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
                    this.plugin.refreshTreeLeafs();
                });
            });

        /* ------------- File Pane Settings ------------- */
        containerEl.createEl('h2', { text: 'File Pane Settings' });

        new Setting(containerEl)
            .setName('Include Files From Subfolders to the File List')
            .setDesc(`Turn on this option if you want to see the list of files from all subfolders in addition to the selected folder`)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.showFilesFromSubFolders).onChange((value) => {
                    this.plugin.settings.showFilesFromSubFolders = value;
                    this.plugin.saveSettings();
                    this.plugin.refreshTreeLeafs();
                })
            );

        new Setting(containerEl)
            .setName('Toggle Button for Include Files from Subfolders')
            .setDesc(`Turn on this option if you want to have an additional button on the top of the file list to toggle "Include Files From Subfolders"`)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.showFilesFromSubFoldersButton).onChange((value) => {
                    this.plugin.settings.showFilesFromSubFoldersButton = value;
                    this.plugin.saveSettings();
                    this.plugin.refreshTreeLeafs();
                })
            );

        new Setting(containerEl)
            .setName('Search in File List')
            .setDesc(`Turn on this option if you want to enable search function to filter files by name.`)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.searchFunction).onChange((value) => {
                    this.plugin.settings.searchFunction = value;
                    this.plugin.saveSettings();
                    this.plugin.refreshTreeLeafs();
                })
            );

        new Setting(containerEl)
            .setName('Sort Files By')
            .setDesc('Select your preference how the files should be sorted in the file list')
            .addDropdown((cb) => {
                cb.addOption('name', 'Name');
                cb.addOption('last-update', 'Last Update');
                cb.setValue(this.plugin.settings.sortFilesBy);
                cb.onChange((option: 'name' | 'last-update') => {
                    this.plugin.settings.sortFilesBy = option;
                    this.plugin.saveSettings();
                    this.plugin.refreshTreeLeafs();
                });
            });

        new Setting(containerEl)
            .setName('Preview File on Hover')
            .setDesc('Turn on if you want to preview the files once you hover on them within the file list.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.filePreviewOnHover).onChange((value) => {
                    this.plugin.settings.filePreviewOnHover = value;
                    this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Fixed Buttons and Header in File Pane')
            .setDesc('Turn on if you want buttons and header to be not scrolled within the file list.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.fixedHeaderInFileList).onChange((value) => {
                    this.plugin.settings.fixedHeaderInFileList = value;
                    this.plugin.saveSettings();
                    this.plugin.refreshTreeLeafs();
                })
            );

        /* ------------- Exclusion Settings ------------- */

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
