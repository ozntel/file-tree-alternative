import FileTreeAlternativePlugin from './main';
import { PluginSettingTab, Setting, App, Notice } from 'obsidian';
import { LocalStorageHandler } from '@ozntel/local-storage-handler';
import { eventTypes } from 'utils/types';

type FolderIcon = 'default' | 'box-folder' | 'icomoon' | 'typicon' | 'circle-gg';
export type SortType = 'name' | 'last-update' | 'created' | 'file-size';
export type FolderSortType = 'name' | 'item-number';
export type DeleteFileOption = 'trash' | 'permanent' | 'system-trash';
export type EvernoteViewOption = 'Disabled' | 'Horizontal' | 'Vertical';
export type RainbowColorOption = 'accent' | 'rosewater' | 'flamingo' | 'pink' | 'mauve' | 'red' | 'maroon' | 'peach' | 'yellow' | 'green' | 'teal' | 'sky' | 'sapphire' | 'blue' | 'lavender' | 'custom';

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
    hideAttachments: boolean;
    attachmentsFolderName: string;
    folderIcon: FolderIcon;
    folderCount: boolean;
    folderCountOption: string;
    evernoteView: EvernoteViewOption;
    filePreviewOnHover: boolean;
    iconBeforeFileName: boolean;
    sortFilesBy: SortType;
    sortReverse: boolean;
    sortFoldersBy: FolderSortType;
    fixedHeaderInFileList: boolean;
    createdYaml: boolean;
    fileNameIsHeader: boolean;
    folderNote: boolean;
    deleteFileOption: DeleteFileOption;
    showFileNameAsFullPath: boolean;
    bookmarksEvents: boolean;
    rainbowFolders: boolean;
    rainbowColorRepeat: number;
    rainbowColors: RainbowColorOption[];
    rainbowCustomColors: string[];
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
    hideAttachments: false,
    attachmentsFolderName: 'attachments',
    folderIcon: 'default',
    folderCount: true,
    folderCountOption: 'notes',
    evernoteView: 'Vertical',
    filePreviewOnHover: false,
    iconBeforeFileName: true,
    sortFilesBy: 'name',
    sortReverse: false,
    sortFoldersBy: 'name',
    fixedHeaderInFileList: true,
    createdYaml: false,
    fileNameIsHeader: false,
    folderNote: false,
    deleteFileOption: 'trash',
    showFileNameAsFullPath: false,
    bookmarksEvents: false,
    rainbowFolders: false,
    rainbowColorRepeat: 12,
    rainbowColors: [
        'red',        // 1. 红色
        'peach',      // 2. 橙色
        'yellow',     // 3. 黄色
        'green',      // 4. 绿色
        'teal',       // 5. 青色
        'sky',        // 6. 天蓝色
        'sapphire',   // 7. 宝石蓝
        'blue',       // 8. 蓝色
        'lavender',   // 9. 薰衣草紫
        'mauve',      // 10. 紫色
        'pink',       // 11. 粉红色
        'rosewater',  // 12. 玫瑰水
    ],
    rainbowCustomColors: [
        '#FF6B6B', '#FF9F43', '#FFD93D', '#6BCF7F',
        '#4ECDC4', '#45B7D1', '#5F9DF7', '#A78BFA',
        '#E879F9', '#FF69B4', '#F687B3', '#C084FC',
    ],
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

    async reloadPlugin() {
        // Force plugin reload to refresh all components
        await this.plugin.saveSettings();
        this.plugin.refreshTreeLeafs();
    }

    getOrdinalSuffix(num: number): string {
        const j = num % 10;
        const k = num % 100;
        if (j === 1 && k !== 11) return 'st';
        if (j === 2 && k !== 12) return 'nd';
        if (j === 3 && k !== 13) return 'rd';
        return 'th';
    }

    display(): void {
        let { containerEl } = this;
        containerEl.empty();

        let lsh = new LocalStorageHandler({});

        /* ------------- Buy Me a Coffee ------------- */

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
            .setDesc('Turn on if you want to see the folders and files in a single view without switching between views. Similar experience to Evernote.')
            .addDropdown((dropdown) => {
                dropdown
                    .addOption('Disabled', 'Disabled')
                    .addOption('Horizontal', 'Horizontal')
                    .addOption('Vertical', 'Vertical')
                    .setValue(this.plugin.settings.evernoteView)
                    .onChange((value: EvernoteViewOption) => {
                        this.plugin.settings.evernoteView = value;
                        this.plugin.saveSettings();
                        this.refreshView();
                    });
            });

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
            .setName('Open on Start')
            .setDesc("Turn off if you don't want file tree view to be opened automatically during vault start")
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.openViewOnStart).onChange((value) => {
                    this.plugin.settings.openViewOnStart = value;
                    this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Bookmarks Event Listener (Shift + Click)')
            .setDesc(
                'This will enable to reveal file or folder from core bookmarks plugin.' +
                    'Because there is no API yet to overwrite the default behaviour for Bookmarks plugin,' +
                    'this will add an event to reveal file if you click on bookmark name using shift'
            )
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.bookmarksEvents).onChange((value) => {
                    this.plugin.settings.bookmarksEvents = value;
                    if (value) {
                        this.plugin.bookmarksAddEventListener();
                    } else {
                        this.plugin.bookmarksRemoveEventListener();
                    }
                    this.plugin.saveSettings();
                })
            );

        /* ------------- Folder Pane Settings ------------- */

        containerEl.createEl('h2', { text: 'Folder Pane Settings' });

        new Setting(containerEl)
            .setName('Folder Icons')
            .setDesc('Change the default folder icons your preferred option')
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
            .setDesc(`Turn on if you want your Root Folder "${this.plugin.app.vault.getName()}" to be visible in the file tree`)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.showRootFolder).onChange((value) => {
                    this.plugin.settings.showRootFolder = value;
                    this.plugin.saveSettings();
                    this.refreshView();
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
                    this.refreshView();
                });
            });

        new Setting(containerEl)
            .setName('Folder Note')
            .setDesc(
                `Turn this option on if you want to create Folder Note same as Folder Note Plugin. 
                By default, Click will open the list of files. You need to use "Shift+Click" to open the folder note. If folder has a folder note, 
                you will see an arrow icon on the right side of folder. The note created as a folder note is hidden in the file list.`
            )
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.folderNote).onChange((value) => {
                    this.plugin.settings.folderNote = value;
                    this.plugin.saveSettings();
                    this.refreshView();
                });
            });

        const rainbowFolderSetting = new Setting(containerEl)
            .setName('Rainbow Folders')
            .setDesc('Enable this option to add cycling rainbow colors to folders. Based on Catppuccin theme color scheme.')
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.rainbowFolders).onChange(async (value) => {
                    this.plugin.settings.rainbowFolders = value;
                    await this.plugin.saveSettings();
                    this.reloadPlugin();
                    this.display();
                });
            });

        if (this.plugin.settings.rainbowFolders) {
            // Add collapse/expand functionality
            rainbowFolderSetting.addExtraButton((button) => {
                button
                    .setIcon('chevron-down')
                    .setTooltip('Expand/Collapse Rainbow Folder Settings')
                    .onClick(() => {
                        const isCollapsed = containerEl.querySelector('.rainbow-settings-collapsed');
                        const settingsContainer = containerEl.querySelector('.rainbow-settings-container') as HTMLElement;
                        if (settingsContainer) {
                            if (isCollapsed) {
                                settingsContainer.removeClass('rainbow-settings-collapsed');
                                button.setIcon('chevron-down');
                            } else {
                                settingsContainer.addClass('rainbow-settings-collapsed');
                                button.setIcon('chevron-right');
                            }
                        }
                    });
            });

            const settingsContainer = containerEl.createDiv('rainbow-settings-container');
            
            settingsContainer.createEl('h3', { text: 'Rainbow Folder Configuration' });

            const repeatCountDesc = settingsContainer.createDiv();
            repeatCountDesc.addClass('setting-item-description');
            repeatCountDesc.style.marginBottom = '10px';

            new Setting(settingsContainer)
                .setName('Repeating Color Count')
                .setDesc('Select how many colors to cycle through (1-12). For example, selecting 6 means colors will repeat every 6 folders.')
                .addSlider((slider) => {
                    slider
                        .setLimits(1, 12, 1)
                        .setValue(this.plugin.settings.rainbowColorRepeat)
                        .setDynamicTooltip()
                        .onChange(async (value) => {
                            this.plugin.settings.rainbowColorRepeat = value;
                            await this.plugin.saveSettings();
                            this.reloadPlugin();
                            // Re-render settings page to update enabled/disabled status
                            this.display();
                        });
                });

            settingsContainer.createEl('h3', { text: 'Rainbow Color Scheme' });
            settingsContainer.createEl('p', { 
                text: 'Choose a Catppuccin theme preset color for each position. Only the first ' + this.plugin.settings.rainbowColorRepeat + ' colors will be used.',
                cls: 'setting-item-description'
            });
            
            const colorOptions: { label: string; value: RainbowColorOption }[] = [
                { label: '🎨 Accent', value: 'accent' },
                { label: '🌸 Rosewater', value: 'rosewater' },
                { label: '🦩 Flamingo', value: 'flamingo' },
                { label: '💗 Pink', value: 'pink' },
                { label: '💜 Mauve', value: 'mauve' },
                { label: '🔴 Red', value: 'red' },
                { label: '🍷 Maroon', value: 'maroon' },
                { label: '🍑 Peach', value: 'peach' },
                { label: '💛 Yellow', value: 'yellow' },
                { label: '💚 Green', value: 'green' },
                { label: '🌊 Teal', value: 'teal' },
                { label: '☁️ Sky', value: 'sky' },
                { label: '💎 Sapphire', value: 'sapphire' },
                { label: '💙 Blue', value: 'blue' },
                { label: '💜 Lavender', value: 'lavender' },
                { label: '🎨 Custom Color', value: 'custom' },
            ];

            for (let i = 0; i < 12; i++) {
                const colorIndex = i + 1;
                const isActive = i < this.plugin.settings.rainbowColorRepeat;
                const currentColor = this.plugin.settings.rainbowColors[i] || 'accent';
                const isCustom = currentColor === 'custom';
                
                const setting = new Setting(settingsContainer)
                    .setName(`Color Position ${colorIndex}${!isActive ? ' (Disabled)' : ''}`)
                    .setDesc(`Choose the color for the ${colorIndex}${this.getOrdinalSuffix(colorIndex)} folder`)
                    .addDropdown((dropdown) => {
                        colorOptions.forEach((option) => {
                            dropdown.addOption(option.value, option.label);
                        });
                        dropdown
                            .setValue(currentColor)
                            .onChange(async (value: RainbowColorOption) => {
                                this.plugin.settings.rainbowColors[i] = value;
                                await this.plugin.saveSettings();
                                this.reloadPlugin();
                                // 重新显示设置以显示/隐藏自定义颜色输入框
                                this.display();
                            })
                            .setDisabled(!isActive);
                    });

                // 如果选择了自定义颜色，显示颜色输入框
                if (isCustom && isActive) {
                    setting.addText((text) => {
                        text.inputEl.type = 'color';
                        text.inputEl.style.width = '80px';
                        text.inputEl.style.height = '30px';
                        text.inputEl.style.marginLeft = '10px';
                        text
                            .setValue(this.plugin.settings.rainbowCustomColors[i] || '#FF6B6B')
                            .onChange(async (value) => {
                                this.plugin.settings.rainbowCustomColors[i] = value;
                                await this.plugin.saveSettings();
                                this.reloadPlugin();
                            });
                    });
                }
            }
        }

        /* ------------- File Pane Settings ------------- */
        containerEl.createEl('h2', { text: 'File Pane Settings' });

        new Setting(containerEl)
            .setName('Include Files From Subfolders to the File List')
            .setDesc(`Turn on this option if you want to see the list of files from all subfolders in addition to the selected folder`)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.showFilesFromSubFolders).onChange((value) => {
                    this.plugin.settings.showFilesFromSubFolders = value;
                    this.plugin.saveSettings();
                    this.refreshView();
                })
            );

        new Setting(containerEl)
            .setName('Toggle Button for Include Files from Subfolders')
            .setDesc(`Turn on this option if you want to have an additional button on the top of the file list to toggle "Include Files From Subfolders"`)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.showFilesFromSubFoldersButton).onChange((value) => {
                    this.plugin.settings.showFilesFromSubFoldersButton = value;
                    this.plugin.saveSettings();
                    this.refreshView();
                })
            );

        new Setting(containerEl)
            .setName('Reveal Active File in File Tree Button')
            .setDesc(
                `Turn on this option if you want to have an additional button to reveal the active file in the file tree. It will set the folder and file pane accordingly.`
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
            .setDesc(`Turn on this option if you want to enable search function to filter files by name.`)
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
                `"all:" and "tag:" searches by default looks for all files in your vault. Turn on this option if you want search only in Focused Folder`
            )
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.allSearchOnlyInFocusedFolder).onChange((value) => {
                    this.plugin.settings.allSearchOnlyInFocusedFolder = value;
                    this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Icon Before File Name')
            .setDesc('Turn on if you want to file icon before the file name in the file list.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.iconBeforeFileName).onChange((value) => {
                    this.plugin.settings.iconBeforeFileName = value;
                    this.plugin.saveSettings();
                    this.refreshView();
                })
            );

        new Setting(containerEl)
            .setName('Preview File on Hover')
            .setDesc('Turn on if you want to preview the files once you hover on them within the file list holding Ctrl/Cmd button.')
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
                    this.refreshView();
                })
            );

        new Setting(containerEl)
            .setName('Show file names as full path')
            .setDesc('Turn on if you want to see the full path within the file name list rather than only file name')
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
        containerEl.createEl('h2', { text: 'File Creation' });

        containerEl.createEl('p', { text: 'The settings below are only applicable if the plus (+) button within the file pane of the plugin is used.' });

        new Setting(containerEl)
            .setName('Created information in YAML')
            .setDesc('Turn on if you want plugin to include created YAML key with the time of creation')
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.createdYaml).onChange((value) => {
                    this.plugin.settings.createdYaml = value;
                    this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Set File Name as Header 1')
            .setDesc('Turn on if you want plugin to add the initial file name as main header in the created file.')
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.fileNameIsHeader).onChange((value) => {
                    this.plugin.settings.fileNameIsHeader = value;
                    this.plugin.saveSettings();
                });
            });

        /* ------------- Exclusion Settings ------------- */

        containerEl.createEl('h2', { text: 'Exclude Settings' });

        new Setting(containerEl)
            .setName('Hide Attachments')
            .setDesc(`It will hide "attachments" folder from the view and any file under this folder from the file list`)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.hideAttachments).onChange((value) => {
                    this.plugin.settings.hideAttachments = value;
                    this.plugin.saveSettings();
                    this.plugin.refreshTreeLeafs();
                })
            );

        new Setting(containerEl)
            .setName('Excluded File Extensions')
            .setDesc(
                `Provide extension of files, which you want to exclude from listing in file tree, divided by comma. i.e. 'png, pdf, jpeg'.
            You need to reload the vault or use "Reload File Tree" button below to make changes effective.`
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
            All subfolders are going to be excluded, as well. You need to reload the vault or use "Reload File Tree" button below to make changes effective.`
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
                `This button will clear the following cache data: "Last position of the divider" & "List of expanded folders in the folder pane", 
                & "Last active folder path". It will not touch your settings above and list of pinned files. It is recommended to do this clearing once in a while.`
            )
            .addButton((button) => {
                let b = button
                    .setTooltip('Click here to clear the cache data')
                    .setButtonText('Click for Clearing the Cache')
                    .onClick(async () => {
                        lsh.removeFromLocalStorage({ key: this.plugin.keys.customHeightKey });
                        lsh.removeFromLocalStorage({ key: this.plugin.keys.customWidthKey });
                        lsh.removeFromLocalStorage({ key: this.plugin.keys.openFoldersKey });
                        lsh.removeFromLocalStorage({ key: this.plugin.keys.activeFolderPathKey });
                        lsh.removeFromLocalStorage({ key: this.plugin.keys.focusedFolder });
                        this.plugin.refreshTreeLeafs();
                        new Notice('The plugin cache is cleared...');
                    });
            });

        new Setting(containerEl)
            .setName('Clear Pinned Files')
            .setDesc(`This button will clear the pinned files in the file list pane.`)
            .addButton((button) => {
                let b = button
                    .setTooltip('Click here to clear the pinned files')
                    .setButtonText('Click for Clearing the Pinned files')
                    .onClick(async () => {
                        lsh.removeFromLocalStorage({ key: this.plugin.keys.pinnedFilesKey });
                        this.plugin.refreshTreeLeafs();
                        new Notice('The pinned files are cleared...');
                    });
            });
    }
}
