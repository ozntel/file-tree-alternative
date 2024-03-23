import { TFile, TFolder, App, Keymap, Platform } from 'obsidian';
import FileTreeAlternativePlugin from 'main';
import { FolderFileCountMap, FolderTree, OZFile, BookmarksPluginItem } from 'utils/types';
import { VaultChangeModal } from 'modals';

// Helper Function To Get List of Files
export const getFilesUnderPath = (params: {
    path: string;
    plugin: FileTreeAlternativePlugin;
    excludedExtensions: string[];
    excludedFolders: string[];
    getAllFiles?: boolean;
}): OZFile[] => {
    const { path, plugin, getAllFiles, excludedExtensions, excludedFolders } = params;
    var filesUnderPath: OZFile[] = [];
    var showFilesFromSubFolders = getAllFiles ? true : plugin.settings.showFilesFromSubFolders;
    var folderObj = plugin.app.vault.getAbstractFileByPath(path);
    recursiveFx(folderObj as TFolder, plugin.app);
    function recursiveFx(folderObj: TFolder, app: App) {
        if (folderObj instanceof TFolder && folderObj.children) {
            for (let child of folderObj.children) {
                if (child instanceof TFile) {
                    if (
                        excludedExtensions.includes(child.extension) ||
                        (plugin.settings.hideAttachments && child.path.toLowerCase().includes(plugin.settings.attachmentsFolderName.toLowerCase())) ||
                        excludedFolders.includes(child.parent.path)
                    )
                        continue;
                    filesUnderPath.push(TFile2OZFile(child));
                }
                if (child instanceof TFolder && showFilesFromSubFolders) recursiveFx(child, app);
            }
        }
    }
    return filesUnderPath;
};

// Converted from TFile to OZFile
export const TFile2OZFile = (t: TFile): OZFile => {
    return {
        path: t.path,
        basename: t.basename,
        extension: t.extension,
        stat: {
            mtime: t.stat.mtime,
            ctime: t.stat.ctime,
            size: t.stat.size,
        },
        parent: {
            path: t.parent.path,
        },
        isFolderNote: isFolderNote(t),
    };
};

// Check if the file is a folder note
export const isFolderNote = (t: TFile) => {
    return t.extension === 'md' && t.basename === t.parent.name;
};

// Helper Function to Create Folder Tree
export const createFolderTree = (params: { startFolder: TFolder; excludedFolders: string[]; plugin: FileTreeAlternativePlugin }): FolderTree => {
    const { startFolder, excludedFolders, plugin } = params;
    let fileTree: { folder: TFolder; children: any } = { folder: startFolder, children: [] };
    function recursive(folder: TFolder, object: { folder: TFolder; children: any }) {
        if (!(folder && folder.children)) return;
        for (let child of folder.children) {
            if (child instanceof TFolder) {
                let childFolder: TFolder = child as TFolder;
                if (
                    (plugin.settings.hideAttachments && childFolder.name === plugin.settings.attachmentsFolderName) ||
                    (excludedFolders.length > 0 && excludedFolders.contains(child.path))
                ) {
                    continue;
                }
                let newObj: { folder: TFolder; children: any } = { folder: childFolder, children: [] };
                object.children.push(newObj);
                if (childFolder.children) recursive(childFolder, newObj);
            }
        }
    }
    recursive(startFolder, fileTree);
    return fileTree;
};

// Create Folder File Count Map
export const getFolderNoteCountMap = (plugin: FileTreeAlternativePlugin) => {
    const counts: FolderFileCountMap = {};
    let files: TFile[];
    if (plugin.settings.folderCountOption === 'notes') {
        files = plugin.app.vault.getMarkdownFiles();
    } else {
        files = plugin.app.vault.getFiles();
    }

    // Filter Folder Note Files
    if (plugin.settings.folderNote) {
        files = files.filter((f) => f.extension !== 'md' || (f.extension === 'md' && f.basename !== f.parent.name));
    }

    files.forEach((file) => {
        for (let folder = file.parent; folder != null; folder = folder.parent) {
            // -> Create object if doesn't exist
            if (!counts[folder.path]) counts[folder.path] = { open: 0, closed: 0 };
            // -> Create number for open state
            if (folder == file.parent) counts[folder.path].open = 1 + counts[folder.path].open;
            // -> Create number for closed state
            counts[folder.path].closed = 1 + counts[folder.path].closed;
        }
    });
    return counts;
};

// Check if folder has child folder
export const hasChildFolder = (folder: TFolder): boolean => {
    let children = folder.children;
    for (let child of children) {
        if (child instanceof TFolder) return true;
    }
    return false;
};

// Files out of Md should be listed with extension badge - Md without extension
export const getFileNameAndExtension = (fullName: string) => {
    var index = fullName.lastIndexOf('.');
    return {
        fileName: fullName.substring(0, index),
        extension: fullName.substring(index + 1),
    };
};

// Returns all parent folder paths
export const getParentFolderPaths = (file: TFile): string[] => {
    let folderPaths: string[] = ['/'];
    let parts: string[] = file.parent.path.split('/');
    let current: string = '';
    for (let i = 0; i < parts.length; i++) {
        current += `${i === 0 ? '' : '/'}` + parts[i];
        folderPaths.push(current);
    }
    return folderPaths;
};

// Extracts the Folder Name from the Full Folder Path
export const getFolderName = (folderPath: string, app: App) => {
    if (folderPath === '/') return app.vault.getName();
    let index = folderPath.lastIndexOf('/');
    if (index !== -1) return folderPath.substring(index + 1);
    return folderPath;
};

export const internalPluginLoaded = (pluginName: string, app: App) => {
    // @ts-ignore
    return app.internalPlugins.plugins[pluginName]?._loaded;
};

export const openInternalLink = (event: React.MouseEvent<Element, MouseEvent>, link: string, app: App) => {
    app.workspace.openLinkText(link, '/', Keymap.isModifier(event as unknown as MouseEvent, 'Mod') || 1 === event.button);
};

export const pluginIsLoaded = (app: App, pluginId: string) => {
    // @ts-ignore
    return app.plugins.getPlugin(pluginId);
};

export const platformIsMobile = () => {
    return Platform.isMobile;
};

export const createNewFile = async (e: React.MouseEvent | null, folderPath: string, plugin: FileTreeAlternativePlugin) => {
    let targetFolder = plugin.app.vault.getAbstractFileByPath(folderPath);
    if (!targetFolder) return;
    let modal = new VaultChangeModal(plugin, targetFolder, 'create note');
    modal.open();
};

export const getBookmarksPluginItems = (): BookmarksPluginItem[] => {
    return (app as any).internalPlugins.plugins['bookmarks'].instance.items as BookmarksPluginItem[];
};

export const getBookmarkTitle = (title: string): BookmarksPluginItem => {
    let bookmarkItems = getBookmarksPluginItems();
    let titleParts = title.split('/');
    let currentItem: BookmarksPluginItem = bookmarkItems.find((b) => b.title === titleParts[0]);
    for (let i = 1; i < titleParts.length; i++) {
        currentItem = currentItem.items.find((b) => b.title === titleParts[i]);
    }
    return currentItem;
};
