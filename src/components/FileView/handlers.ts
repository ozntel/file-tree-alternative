import FileTreeAlternativePlugin from 'main';
import { VaultChangeModal, MoveSuggestionModal, ConfirmationModal } from 'modals';
import { OZFile, eventTypes } from 'utils/types';
import * as Util from 'utils/Utils';
import { TFile, TFolder } from 'obsidian';
import * as newFileUtils from 'utils/newFile';
import { SetterOrUpdater } from 'recoil';
import * as Icons from 'utils/icons';
import { Menu } from 'obsidian';
import { isMouseEvent } from 'hooks/useLongPress';
import { SortType } from 'settings';

// ----> FILE TREE COMPONENT HANDLERS <----- \\

// Function After an External File Dropped into Folder Name
export const handleOnDropFiles = (params: { files: File[]; activeFolderPath: string; plugin: FileTreeAlternativePlugin }) => {
    let { files, activeFolderPath, plugin } = params;
    files.map(async (file) => {
        file.arrayBuffer().then((arrayBuffer) => {
            plugin.app.vault.adapter.writeBinary(activeFolderPath + '/' + file.name, arrayBuffer);
        });
    });
};

const getFilesWithName = (params: {
    searchPhrase: string;
    searchFolder: string;
    plugin: FileTreeAlternativePlugin;
    excludedExtensions: string[];
    excludedFolders: string[];
    getAllFiles?: boolean;
}): OZFile[] => {
    let { searchPhrase, searchFolder, plugin, getAllFiles, excludedExtensions, excludedFolders } = params;
    var files: OZFile[] = Util.getFilesUnderPath({
        path: searchFolder,
        plugin: plugin,
        excludedExtensions: excludedExtensions,
        excludedFolders: excludedFolders,
        getAllFiles: getAllFiles,
    });
    var filteredFiles = files.filter((file) => file.basename.toLowerCase().includes(searchPhrase.toLowerCase().trimStart()));
    return filteredFiles;
};

const getFileTags = (params: { f: OZFile; plugin: FileTreeAlternativePlugin }): string[] => {
    let { f, plugin } = params;
    let mdFile = plugin.app.vault.getAbstractFileByPath(f.path) as TFile;
    if (!mdFile) return [];
    let fileCache = plugin.app.metadataCache.getFileCache(mdFile);
    let fileTags: string[] = [];
    if (fileCache.tags) {
        for (let fileTag of fileCache.tags) {
            fileTags.push(fileTag.tag);
        }
    }
    if (fileCache.frontmatter && fileCache.frontmatter['tags']) {
        let tagsFM = fileCache.frontmatter['tags'];
        if (typeof tagsFM === 'string') {
            let fileFMTags = tagsFM.split(',');
            for (let i = 0; i < fileFMTags.length; i++) {
                fileTags.push(fileFMTags[i]);
            }
        } else if (Array.isArray(tagsFM)) {
            for (let i = 0; i < tagsFM.length; i++) {
                fileTags.push(tagsFM[i]);
            }
        }
    }
    return fileTags;
};

const getFilesWithTag = (params: {
    searchTag: string;
    plugin: FileTreeAlternativePlugin;
    focusedFolder: TFolder;
    excludedExtensions: string[];
    excludedFolders: string[];
}): Set<OZFile> => {
    let { searchTag, plugin, focusedFolder, excludedExtensions, excludedFolders } = params;
    let filesWithTag: Set<OZFile> = new Set();
    let ozFiles = Util.getFilesUnderPath({
        path: plugin.settings.allSearchOnlyInFocusedFolder ? focusedFolder.path : '/',
        plugin: plugin,
        excludedExtensions: excludedExtensions,
        excludedFolders: excludedFolders,
        getAllFiles: true,
    });
    for (let ozFile of ozFiles) {
        let fileTags = getFileTags({
            f: ozFile,
            plugin: plugin,
        });
        for (let fileTag of fileTags) {
            if (fileTag.toLowerCase().contains(searchTag.toLowerCase().trimStart())) {
                if (!filesWithTag.has(ozFile)) filesWithTag.add(ozFile);
            }
        }
    }
    return filesWithTag;
};

export const handleRevealActiveFileButton = (params: { plugin: FileTreeAlternativePlugin }) => {
    let { plugin } = params;
    let event = new CustomEvent(eventTypes.revealFile, {
        detail: {
            file: plugin.app.workspace.getActiveFile(),
        },
    });
    window.dispatchEvent(event);
};

// Sort - Filter Files Depending on Preferences
export const sortedFiles = (params: { fileList: OZFile[]; plugin: FileTreeAlternativePlugin; ozPinnedFiles: OZFile[] }) => {
    let { fileList, plugin, ozPinnedFiles } = params;
    let sortedfileList: OZFile[] = fileList;
    // Remove Files for Folder Note (If file name is same as parent folder name)
    if (plugin.settings.folderNote) {
        sortedfileList = sortedfileList.filter((f) => !f.isFolderNote);
    }
    // Sort File by Name or Last Content Update, moving pinned files to the front
    sortedfileList = sortedfileList.sort((a, b) => {
        if (ozPinnedFiles.some((f) => f.path === a.path) && !ozPinnedFiles.some((f) => f.path === b.path)) {
            return -1;
        } else if (!ozPinnedFiles.some((f) => f.path === a.path) && ozPinnedFiles.some((f) => f.path === b.path)) {
            return 1;
        }
        if (plugin.settings.sortReverse) {
            [a, b] = [b, a];
        }
        if (plugin.settings.sortFilesBy === 'name') {
            return plugin.settings.showFileNameAsFullPath
                ? a.path.localeCompare(b.path, 'en', { numeric: true })
                : a.basename.localeCompare(b.basename, 'en', { numeric: true });
        } else if (plugin.settings.sortFilesBy === 'last-update') {
            return b.stat.mtime - a.stat.mtime;
        } else if (plugin.settings.sortFilesBy === 'created') {
            return b.stat.ctime - a.stat.ctime;
        } else if (plugin.settings.sortFilesBy === 'file-size') {
            return b.stat.size - a.stat.size;
        }
    });
    return sortedfileList;
};

export const sortFileListClickHandle = (params: { e: React.MouseEvent; plugin: FileTreeAlternativePlugin; forceUpdate: () => void }) => {
    let { e, plugin, forceUpdate } = params;
    const sortMenu = new Menu();

    const changeSortSettingTo = (newValue: SortType) => {
        plugin.settings.sortFilesBy = newValue;
        plugin.saveSettings();
        forceUpdate();
    };

    const addMenuItem = (label: string, low: string, high: string, value: SortType) => {
        sortMenu.addItem((menuItem) => {
            const order = plugin.settings.sortReverse ? `${high} to ${low}` : `${low} to ${high}`;
            menuItem.setTitle(`${label} (${order})`);
            menuItem.setIcon(value === plugin.settings.sortFilesBy ? 'checkmark' : 'spaceIcon');
            menuItem.onClick(() => changeSortSettingTo(value));
        });
    };

    addMenuItem('File Name', 'A', 'Z', 'name');
    addMenuItem('Created', 'New', 'Old', 'created');
    addMenuItem('File Size', 'Big', 'Small', 'file-size');
    addMenuItem('Last Update', 'New', 'Old', 'last-update');

    sortMenu.addSeparator();

    sortMenu.addItem((menuItem) => {
        menuItem.setTitle('Reverse Order');
        menuItem.setIcon(plugin.settings.sortReverse ? 'checkmark' : 'spaceIcon');
        menuItem.onClick(() => {
            plugin.settings.sortReverse = !plugin.settings.sortReverse;
            plugin.saveSettings();
            forceUpdate();
        });
    });

    // Trigger
    sortMenu.showAtPosition({ x: e.pageX, y: e.pageY });
};

// Search Function
const searchAllRegex = new RegExp('all:(.*)?');
const searchTagRegex = new RegExp('tag:(.*)?');
export const handleSearch = (params: {
    e: React.ChangeEvent<HTMLInputElement>;
    activeFolderPath: string;
    setSearchPhrase: React.Dispatch<React.SetStateAction<string>>;
    setTreeHeader: React.Dispatch<React.SetStateAction<string>>;
    setOzFileList: SetterOrUpdater<OZFile[]>;
    excludedExtensions: string[];
    excludedFolders: string[];
    plugin: FileTreeAlternativePlugin;
    focusedFolder: TFolder;
}) => {
    let { e, activeFolderPath, setSearchPhrase, setOzFileList, setTreeHeader, plugin, focusedFolder, excludedExtensions, excludedFolders } = params;
    var searchPhrase = e.target.value;
    setSearchPhrase(searchPhrase);
    var searchFolder = activeFolderPath;

    // Check Tag Regex in Search Phrase
    let tagRegexMatch = searchPhrase.match(searchTagRegex);
    if (tagRegexMatch) {
        setTreeHeader('Files with Tag');
        if (tagRegexMatch[1] === undefined || tagRegexMatch[1].replace(/\s/g, '').length === 0) {
            setOzFileList([]);
            return;
        }
        setOzFileList([
            ...getFilesWithTag({
                searchTag: tagRegexMatch[1],
                plugin: plugin,
                focusedFolder: focusedFolder,
                excludedExtensions: excludedExtensions,
                excludedFolders: excludedFolders,
            }),
        ]);
        return;
    }

    // Check All Regex in Search Phrase
    let allRegexMatch = searchPhrase.match(searchAllRegex);
    if (allRegexMatch) {
        searchPhrase = allRegexMatch[1] ? allRegexMatch[1] : '';
        searchFolder = plugin.settings.allSearchOnlyInFocusedFolder ? focusedFolder.path : '/';
        setTreeHeader('All Files');
    } else {
        setTreeHeader(Util.getFolderName(activeFolderPath, plugin.app));
    }

    let getAllFiles = allRegexMatch ? true : false;
    let filteredFiles = getFilesWithName({
        searchPhrase,
        searchFolder,
        plugin,
        excludedExtensions,
        excludedFolders,
        getAllFiles,
    });
    setOzFileList(filteredFiles);
};

// ----> NAV FILE COMPONENT HANDLERS <----- \\

// Handle Click Event on File - Allows Open with Cmd/Ctrl
export const openFile = (params: { file: OZFile; e: React.MouseEvent; plugin: FileTreeAlternativePlugin; setActiveOzFile: SetterOrUpdater<OZFile> }) => {
    let { file, e, plugin, setActiveOzFile } = params;
    newFileUtils.openFile({
        file: file,
        app: plugin.app,
        newLeaf: (e.ctrlKey || e.metaKey) && !(e.shiftKey || e.altKey),
        leafBySplit: (e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey),
    });
    setActiveOzFile(file);
};

export const getFileIcon = (params: { file: OZFile }) => {
    let { file } = params;
    return file.extension === 'pdf'
        ? Icons.AiFillFilePdf
        : ['png', 'jpg', 'jpeg', 'svg'].contains(file.extension)
        ? Icons.AiFillFileImage
        : ['doc', 'docx'].contains(file.extension)
        ? Icons.AiFillFileWord
        : Icons.BiFile;
};

// --> Dragging for File
export const dragStarted = (params: { e: React.DragEvent<HTMLDivElement>; file: OZFile; plugin: FileTreeAlternativePlugin }) => {
    let { e, file, plugin } = params;
    let obsidianFile = plugin.app.vault.getAbstractFileByPath(file.path);
    if (!obsidianFile) return;

    // json to move file to folder
    e.dataTransfer.setData('application/json', JSON.stringify({ filePath: file.path }));

    let dragManager = (plugin.app as any).dragManager;
    const dragData = dragManager.dragFile(e.nativeEvent, obsidianFile);
    dragManager.onDragStart(e.nativeEvent, dragData);
};

// --> AuxClick (Mouse Wheel Button Action)
export const onAuxClick = (params: { e: React.MouseEvent<HTMLDivElement, MouseEvent>; plugin: FileTreeAlternativePlugin; file: OZFile }) => {
    let { e, plugin, file } = params;
    if (e.button === 1) newFileUtils.openFileInNewTab(plugin.app, file);
};

export const mouseEnteredOnFile = (params: {
    e: React.MouseEvent<HTMLDivElement, MouseEvent>;
    file: OZFile;
    plugin: FileTreeAlternativePlugin;
    setHoverActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    let { e, file, plugin, setHoverActive } = params;
    setHoverActive(true);
    if (plugin.settings.filePreviewOnHover && (e.ctrlKey || e.metaKey)) {
        plugin.app.workspace.trigger('link-hover', {}, e.target, file.path, file.path);
    }
};

export const mouseLeftFile = (params: {
    e: React.MouseEvent<HTMLDivElement, MouseEvent>;
    file: OZFile;
    setHoverActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    params.setHoverActive(false);
};

// Handle Right Click Event on File - Custom Menu
export const triggerContextMenu = (params: {
    file: OZFile;
    e: React.MouseEvent | React.TouchEvent;
    ozPinnedFiles: OZFile[];
    setOzPinnedFiles: SetterOrUpdater<OZFile[]>;
    plugin: FileTreeAlternativePlugin;
}) => {
    let { file, e, ozPinnedFiles, setOzPinnedFiles, plugin } = params;
    const fileMenu = new Menu();
    let fileToTrigger = plugin.app.vault.getAbstractFileByPath(file.path);

    if (!fileToTrigger) return;

    // Pin - Unpin Item
    fileMenu.addItem((menuItem) => {
        menuItem.setIcon('pin');
        const isAlreadyPinned: boolean = ozPinnedFiles.some((pinnedFile) => pinnedFile.path === file.path);
        if (isAlreadyPinned) menuItem.setTitle('Unpin');
        else menuItem.setTitle('Pin to Top');
        menuItem.onClick((ev: MouseEvent) => {
            if (isAlreadyPinned) {
                let newPinnedFiles = ozPinnedFiles.filter((pinnedFile) => pinnedFile.path !== file.path);
                setOzPinnedFiles(newPinnedFiles);
            } else {
                setOzPinnedFiles([...ozPinnedFiles, file]);
            }
        });
    });

    // Rename Item
    fileMenu.addItem((menuItem) => {
        menuItem.setTitle('Rename');
        menuItem.setIcon('pencil');
        menuItem.onClick((ev: MouseEvent) => {
            let vaultChangeModal = new VaultChangeModal(plugin, file, 'rename');
            vaultChangeModal.open();
        });
    });

    // Delete Item
    fileMenu.addItem((menuItem) => {
        menuItem.setTitle('Delete');
        menuItem.setIcon('trash');
        menuItem.onClick((ev: MouseEvent) => {
            let confirmationModal = new ConfirmationModal(
                plugin,
                `Are you sure you want to delete the file "${file.basename}${file.extension === 'md' ? '' : file.extension}"?`,
                function () {
                    let deleteOption = plugin.settings.deleteFileOption;
                    let fileToDelete = plugin.app.vault.getAbstractFileByPath(file.path);
                    if (!fileToDelete) return;
                    if (deleteOption === 'permanent') {
                        plugin.app.vault.delete(fileToDelete, true);
                    } else if (deleteOption === 'system-trash') {
                        plugin.app.vault.trash(fileToDelete, true);
                    } else if (deleteOption === 'trash') {
                        plugin.app.vault.trash(fileToDelete, false);
                    }
                }
            );
            confirmationModal.open();
        });
    });

    // Open in a New Pane
    fileMenu.addItem((menuItem) => {
        menuItem.setIcon('go-to-file');
        menuItem.setTitle('Open in a new tab');
        menuItem.onClick((ev: MouseEvent) => {
            newFileUtils.openFileInNewTab(plugin.app, file);
        });
    });

    // Open in a New Pane
    fileMenu.addItem((menuItem) => {
        menuItem.setIcon('go-to-file');
        menuItem.setTitle('Open to right');
        menuItem.onClick((ev: MouseEvent) => {
            newFileUtils.openFileInNewTabGroup(plugin.app, file);
        });
    });

    // Make a Copy Item
    fileMenu.addItem((menuItem) => {
        menuItem.setTitle('Make a copy');
        menuItem.setIcon('documents');
        menuItem.onClick((ev: MouseEvent) => {
            let fileToCopy = plugin.app.vault.getAbstractFileByPath(file.path);
            if (fileToCopy) {
                plugin.app.vault.copy(fileToCopy as TFile, `${file.parent.path}/${file.basename} 1.${file.extension}`);
            }
        });
    });

    // Move Item
    if (!Util.internalPluginLoaded('file-explorer', plugin.app)) {
        fileMenu.addItem((menuItem) => {
            menuItem.setTitle('Move file to...');
            menuItem.setIcon('paper-plane');
            menuItem.onClick((ev: MouseEvent) => {
                let fileMoveSuggester = new MoveSuggestionModal(plugin.app, file);
                fileMoveSuggester.open();
            });
        });
    }

    // Trigger
    plugin.app.workspace.trigger('file-menu', fileMenu, fileToTrigger, 'file-explorer');
    if (isMouseEvent(e)) {
        fileMenu.showAtPosition({ x: e.pageX, y: e.pageY });
    } else {
        // @ts-ignore
        fileMenu.showAtPosition({ x: e.nativeEvent.locationX, y: e.nativeEvent.locationY });
    }
    return false;
};
