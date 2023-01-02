import FileTreeAlternativePlugin, { eventTypes } from './main';
import { PluginSettingTab, Setting, App, Notice } from 'obsidian';
import { LocalStorageHandler } from '@ozntel/local-storage-handler';

type FolderIcon = 'default' | 'box-folder' | 'icomoon' | 'typicon' | 'circle-gg';
export type SortType = 'name' | 'name-rev' | 'last-update' | 'last-update-rev' | 'created' | 'created-rev' | 'file-size' | 'file-size-rev';
export type FolderSortType = 'name' | 'item-number';
export type DeleteFileOption = 'trash' | 'permanent' | 'system-trash';

export interface FileTreeAlternativePluginSettings {
    openViewOnStart: boolean;
    ribbonIcon: boolean;
    showRootFolder: boolean;
    showFilesFromSubFolders: boolean;
    searchFunction: boolean;
    allSearchOnlyInFocusedFolder: boolean;
    showFilesFromSubFoldersButton: boolean;
    revealActiveFileButton: boolean;
    excludedExtensions: string;
    excludedFolders: string;
    folderIcon: FolderIcon;
    folderCount: boolean;
    folderCountOption: string;
    evernoteView: boolean;
    filePreviewOnHover: boolean;
    iconBeforeFileName: boolean;
    sortFilesBy: SortType;
    sortFoldersBy: FolderSortType;
    fixedHeaderInFileList: boolean;
    createdYaml: boolean;
    fileNameIsHeader: boolean;
    folderNote: boolean;
    deleteFileOption: DeleteFileOption;
    showFileNameAsFullPath: boolean;
}

export const DEFAULT_SETTINGS: FileTreeAlternativePluginSettings = {
    openViewOnStart: true,
    ribbonIcon: true,
    showRootFolder: true,
    showFilesFromSubFolders: true,
    searchFunction: true,
    allSearchOnlyInFocusedFolder: false,
    showFilesFromSubFoldersButton: true,
    revealActiveFileButton: false,
    excludedExtensions: '',
    excludedFolders: '',
    folderIcon: 'default',
    folderCount: true,
    folderCountOption: 'notes',
    evernoteView: true,
    filePreviewOnHover: false,
    iconBeforeFileName: true,
    sortFilesBy: 'name',
    sortFoldersBy: 'name',
    fixedHeaderInFileList: true,
    createdYaml: false,
    fileNameIsHeader: false,
    folderNote: false,
    deleteFileOption: 'trash',
    showFileNameAsFullPath: false,
};

export class FileTreeAlternativePluginSettingsTab extends PluginSettingTab {
    plugin: FileTreeAlternativePlugin;

    constructor(app: App, plugin: FileTreeAlternativePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    refreshView() {
        let evt = new CustomEvent(eventTypes.refreshView, {});
        window.dispatchEvent(evt);
    }

    display(): void {
        let { containerEl } = this;
        containerEl.empty();

        let lsh = new LocalStorageHandler({});

        /* ------------- Buy Me a Coffee ------------- */

        const tipDiv = containerEl.createDiv('tip');
        tipDiv.addClass('oz-tip-div');
        const tipLink = tipDiv.createEl('a', { href: 'https://revolut.me/ozante' });
        const tipImg = tipLink.createEl('img', {
            attr: {
                src: 'https://raw.githubusercontent.com/ozntel/file-tree-alternative/main/images/tip%20the%20artist_v2.png',
            },
        });
        tipImg.height = 55;

        const coffeeDiv = containerEl.createDiv('coffee');
        coffeeDiv.addClass('oz-coffee-div');
        const coffeeLink = coffeeDiv.createEl('a', { href: 'https://ko-fi.com/L3L356V6Q' });
        const coffeeImg = coffeeLink.createEl('img', {
            attr: {
                src: 'https://cdn.ko-fi.com/cdn/kofi2.png?v=3',
            },
        });
        coffeeImg.height = 45;

        /* ------------- General Settings ------------- */

        containerEl.createEl('h2', { text: 'General' });

        new Setting(containerEl)
            .setName('Evernote View')
            .setDesc('Show the folders and files in a single view without switching between views. Similar experience to Evernote.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.evernoteView).onChange((value) => {
                    this.plugin.settings.evernoteView = value;
                    this.plugin.saveSettings();
                    this.refreshView();
                })
            );

        new Setting(containerEl)
            .setName('Ribbon Icon')
            .setDesc('Enables a ribbon icon for activating the file tree')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.ribbonIcon).onChange((value) => {
                    this.plugin.settings.ribbonIcon = value;
                    this.plugin.saveSettings();
                    this.plugin.refreshIconRibbon();
                })
            );

        new Setting(containerEl)
            .setName('Open on Start')
            .setDesc("Open the file tree view automatically during vault start")
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.openViewOnStart).onChange((value) => {
                    this.plugin.settings.openViewOnStart = value;
                    this.plugin.saveSettings();
                })
            );

        /* ------------- Folder Pane Settings ------------- */

        containerEl.createEl('h2', { text: 'Folder Pane Settings' });

        new Setting(containerEl)
            .setName('Folder Icons')
            .setDesc('Change the default folder icons to your preferred option')
            .addDropdown((dropdown) => {
                dropdown
                    .addOption('default', 'Default')
                    .addOption('box-folder', 'Box Icons')
                    .addOption('icomoon', 'IcoMoon Icons')
                    .addOption('typicon', 'Typicons')
                    .addOption('circle-gg', 'Circle GG')
                    .setValue(this.plugin.settings.folderIcon)
                    .onChange((value: FolderIcon) => {
                        this.plugin.settings.folderIcon = value;
                        this.plugin.saveSettings();
                        this.refreshView();
                    });
            });

        new Setting(containerEl)
            .setName('Show Root Folder')
            .setDesc(`Make your Root Folder "${this.plugin.app.vault.getName()}" visible in the file tree`)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.showRootFolder).onChange((value) => {
                    this.plugin.settings.showRootFolder = value;
                    this.plugin.saveSettings();
                    this.refreshView();
                })
            );

        new Setting(containerEl)
            .setName('Folder Count')
            .setDesc('Show the number of notes/files under the file tree')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.folderCount).onChange((value) => {
                    this.plugin.settings.folderCount = value;
                    this.plugin.saveSettings();
                    this.plugin.refreshTreeLeafs();
                })
            );

        new Setting(containerEl)
            .setName('Folder Count Details')
            .setDesc('Select which files you want to be included in the count')
            .addDropdown((dropdown) => {
                dropdown.addOption('notes', 'Notes');
                dropdown.addOption('files', 'All Files');
                dropdown.setValue(this.plugin.settings.folderCountOption);
                dropdown.onChange((option) => {
                    this.plugin.settings.folderCountOption = option;
                    this.plugin.saveSettings();
                    this.refreshView();
                });
            });

        new Setting(containerEl)
            .setName('Folder Note')
            .setDesc(
                `Enables the creation of folder notes, similar to the Folder Note plugin. 
                By default, Click will open the list of files. You need to use Shift+Click to open the folder note. If folder has a folder note, 
                you will see an arrow icon on the right side of folder. The note created as a folder note is hidden in the file list.`
            )
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.folderNote).onChange((value) => {
                    this.plugin.settings.folderNote = value;
                    this.plugin.saveSettings();
                    this.refreshView();
                });
            });

        /* ------------- File Pane Settings ------------- */
        containerEl.createEl('h2', { text: 'File Pane Settings' });

        new Setting(containerEl)
            .setName('Include Files from Subfolders in the File List')
            .setDesc(`Show the list of files from all subfolders in addition to those from the selected folder`)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.showFilesFromSubFolders).onChange((value) => {
                    this.plugin.settings.showFilesFromSubFolders = value;
                    this.plugin.saveSettings();
                    this.refreshView();
                })
            );

        new Setting(containerEl)
            .setName('Toggle Button for Include Files from Subfolders')
            .setDesc(`Provides an additional button at the top of the file list to toggle "Include Files From Subfolders"`)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.showFilesFromSubFoldersButton).onChange((value) => {
                    this.plugin.settings.showFilesFromSubFoldersButton = value;
                    this.plugin.saveSettings();
                    this.refreshView();
                })
            );

        new Setting(containerEl)
            .setName('Button for Reveal Active File in File Tree')
            .setDesc(
                `Provides an additional button to reveal the active file in the file tree. The folder and file pane will be set accordingly.`
            )
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.revealActiveFileButton).onChange((value) => {
                    this.plugin.settings.revealActiveFileButton = value;
                    this.plugin.saveSettings();
                    this.refreshView();
                })
            );

        new Setting(containerEl)
            .setName('Search in File List')
            .setDesc(`Enable a search function to filter files by name`)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.searchFunction).onChange((value) => {
                    this.plugin.settings.searchFunction = value;
                    this.plugin.saveSettings();
                    this.refreshView();
                })
            );

        new Setting(containerEl)
            .setName('All & Tag Search only in Focused Folder')
            .setDesc(
                `Make "all:" and "tag:" searches only look in the focused folder, rather than your whole vault`
            )
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.allSearchOnlyInFocusedFolder).onChange((value) => {
                    this.plugin.settings.allSearchOnlyInFocusedFolder = value;
                    this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Icon Before File Name')
            .setDesc('Show a file icon before the file name in the file list')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.iconBeforeFileName).onChange((value) => {
                    this.plugin.settings.iconBeforeFileName = value;
                    this.plugin.saveSettings();
                    this.refreshView();
                })
            );

        new Setting(containerEl)
            .setName('Preview File on Hover')
            .setDesc('Enable previews of files by hovering over them within the file list (by holding Ctrl/Cmd)')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.filePreviewOnHover).onChange((value) => {
                    this.plugin.settings.filePreviewOnHover = value;
                    this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Fixed Buttons and Header in File Pane')
            .setDesc('Buttons and headers will not be scrolled with the file list')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.fixedHeaderInFileList).onChange((value) => {
                    this.plugin.settings.fixedHeaderInFileList = value;
                    this.plugin.saveSettings();
                    this.refreshView();
                })
            );

        new Setting(containerEl)
            .setName('Show File Names as Full Path')
            .setDesc('Show the full path within the file name list rather than only file name')
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.showFileNameAsFullPath).onChange((value) => {
                    this.plugin.settings.showFileNameAsFullPath = value;
                    this.plugin.saveSettings();
                    this.refreshView();
                });
            });

        new Setting(containerEl)
            .setName('Deleted File Destination')
            .setDesc('Select where you want files to be moved once they are deleted')
            .addDropdown((dropdown) => {
                dropdown.addOption('permanent', 'Delete Permanently');
                dropdown.addOption('trash', 'Move to Obsidian Trash');
                dropdown.addOption('system-trash', 'Move to System Trash');
                dropdown.setValue(this.plugin.settings.deleteFileOption);
                dropdown.onChange((option: DeleteFileOption) => {
                    this.plugin.settings.deleteFileOption = option;
                    this.plugin.saveSettings();
                });
            });

        /* ------------- Exclusion Settings ------------- */
        containerEl.createEl('h2', { text: 'File Creation Settings' });

        containerEl.createEl('p', { text: 'The settings below are only enforced when files are created using the plus (+) button within the file pane of the plugin' });

        new Setting(containerEl)
            .setName('Created information in YAML')
            .setDesc('Include a created YAML key with the time of creation')
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.createdYaml).onChange((value) => {
                    this.plugin.settings.createdYaml = value;
                    this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Set File Name as Header 1')
            .setDesc('Add the file name as the main header in the created file')
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.fileNameIsHeader).onChange((value) => {
                    this.plugin.settings.fileNameIsHeader = value;
                    this.plugin.saveSettings();
                });
            });

        /* ------------- Exclusion Settings ------------- */

        containerEl.createEl('h2', { text: 'Exclude Settings' });

        new Setting(containerEl)
            .setName('Excluded File Extensions')
            .setDesc(
                `Provide extensions of files which you want to exclude from listing in the file tree, separated by commas (e.g. "png, pdf, jpeg").
            You need to reload the vault or use the "Reload File Tree" button below to make changes effective.`
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
                `Provide full path of folders which you want to exclude from listing in file tree, separated by commas (e.g. "Personal/Attachments, Work/Documents/Folders
).
            All subfolders will be excluded as well. You need to reload the vault or use the "Reload File Tree" button below to make changes effective.`
            )
            .addTextArea((text) =>
                text.setValue(this.plugin.settings.excludedFolders).onChange((value) => {
                    this.plugin.settings.excludedFolders = value;
                    this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setDesc(
                'Use this button to reload the file tree. Reloading the file tree is required for some of the settings. You can also restart your vault to have same effect.'
            )
            .addButton((button) => {
                button
                    .setClass('reload-file-tree-button')
                    .setTooltip('Click here to reload the file tree')
                    .setButtonText('Reload File Tree')
                    .onClick((e) => {
                        this.plugin.refreshTreeLeafs();
                    });
            });

        /* ------------- Clear Data ------------- */
        containerEl.createEl('h2', { text: 'Clear Data' });

        new Setting(containerEl)
            .setName('Clear All Cache Data')
            .setDesc(
                `Use this button to clear the following cache data: "Last position of the divider", "List of expanded folders in the folder pane", 
                & "Last active folder path". It will not change the settings above nor the list of pinned files. It is recommended to do this once in a while.`
            )
            .addButton((button) => {
                let b = button
                    .setTooltip('Click here to clear the cache data')
                    .setButtonText('Clear Cache')
                    .onClick(async () => {
                        lsh.removeFromLocalStorage({ key: this.plugin.keys.customHeightKey });
                        lsh.removeFromLocalStorage({ key: this.plugin.keys.openFoldersKey });
                        lsh.removeFromLocalStorage({ key: this.plugin.keys.activeFolderPathKey });
                        lsh.removeFromLocalStorage({ key: this.plugin.keys.focusedFolder });
                        this.plugin.refreshTreeLeafs();
                        new Notice('The plugin cache is cleared');
                    });
            });

        new Setting(containerEl)
            .setName('Clear Pinned Files')
            .setDesc(`Use this button to clear the pinned files in the file list pane`)
            .addButton((button) => {
                let b = button
                    .setTooltip('Click here to clear the pinned files')
                    .setButtonText('Clear Pinned Files')
                    .onClick(async () => {
                        lsh.removeFromLocalStorage({ key: this.plugin.keys.pinnedFilesKey });
                        this.plugin.refreshTreeLeafs();
                        new Notice('The pinned files are cleared');
                    });
            });
    }
}
