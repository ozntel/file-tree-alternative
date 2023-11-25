import { TFile, TFolder, App, Keymap, Platform } from 'obsidian';
import FileTreeAlternativePlugin from 'main';
import { FolderFileCountMap, FolderTree, eventTypes } from 'utils/types';
import { stripIndents } from 'common-tags';
import dayjs from 'dayjs';
import { VaultChangeModal } from 'modals';

// Helper Function To Get List of Files
export const getFilesUnderPath = (path: string, plugin: FileTreeAlternativePlugin, getAllFiles?: boolean): TFile[] => {
    var filesUnderPath: TFile[] = [];
    var showFilesFromSubFolders = getAllFiles ? true : plugin.settings.showFilesFromSubFolders;
    recursiveFx(path, plugin.app);
    function recursiveFx(path: string, app: App) {
        var folderObj = app.vault.getAbstractFileByPath(path);
        if (folderObj instanceof TFolder && folderObj.children) {
            for (let child of folderObj.children) {
                if (child instanceof TFile) filesUnderPath.push(child);
                if (child instanceof TFolder && showFilesFromSubFolders) recursiveFx(child.path, app);
            }
        }
    }
    return filesUnderPath;
};

// Helper Function to Create Folder Tree
export const createFolderTree = (startFolder: TFolder): FolderTree => {
    let fileTree: { folder: TFolder; children: any } = { folder: startFolder, children: [] };
    function recursive(folder: TFolder, object: { folder: TFolder; children: any }) {
        if (!(folder && folder.children)) return;
        for (let child of folder.children) {
            if (child instanceof TFolder) {
                let childFolder: TFolder = child as TFolder;
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

export const openFile = (props: { file: TFile; app: App; newLeaf: boolean; leafBySplit?: boolean }) => {
    const { file, app, newLeaf, leafBySplit } = props;
    let leaf = app.workspace.getLeaf(newLeaf);
    if (leafBySplit) leaf = app.workspace.createLeafBySplit(leaf, 'vertical');
    app.workspace.setActiveLeaf(leaf, {
        focus: false,
    });
    leaf.openFile(file, { eState: { focus: true } });
};

export const openInternalLink = (event: React.MouseEvent<Element, MouseEvent>, link: string, app: App) => {
    app.workspace.openLinkText(link, '/', Keymap.isModifier(event as unknown as MouseEvent, 'Mod') || 1 === event.button);
};

export const openFileInNewTab = (app: App, file: TFile) => {
    openFile({ file: file, app: app, newLeaf: true });
};

export const openFileInNewTabGroup = (app: App, file: TFile) => {
    openFile({ file: file, app: app, newLeaf: false, leafBySplit: true });
};

export const getFileCreateString = (params: { plugin: FileTreeAlternativePlugin; fileName: string }): string => {
    const { plugin, fileName } = params;

    return stripIndents`
    ${
        plugin.settings.createdYaml
            ? `
        ---
        created: ${dayjs(new Date()).format('YYYY-MM-DD hh:mm:ss')}
        ---
        `
            : ''
    }
    ${plugin.settings.fileNameIsHeader ? `# ${fileName}` : ''}
    `;
};

export const pluginIsLoaded = (app: App, pluginId: string) => {
    // @ts-ignore
    return app.plugins.getPlugin(pluginId);
};

export const createNewMarkdownFile = async (plugin: FileTreeAlternativePlugin, folder: TFolder, newFileName: string, content?: string) => {
    // @ts-ignore
    const newFile = await plugin.app.fileManager.createNewMarkdownFile(folder, newFileName);
    if (content && content !== '') await plugin.app.vault.modify(newFile, content);
    openFile({ file: newFile, app: plugin.app, newLeaf: false });
    let evt = new CustomEvent(eventTypes.activeFileChange, { detail: { filePath: newFile.path } });
    window.dispatchEvent(evt);
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
