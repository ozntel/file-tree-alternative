import { TAbstractFile, TFile, TFolder, Notice } from 'obsidian';
import React, { useEffect } from 'react';
import { FileComponent } from 'components/FileView/FileComponent';
import { MainFolder } from 'components/FolderView/MainFolder';
import { SingleView } from 'components/MainView/SingleView';
import { FileTreeView } from 'FileTreeView';
import FileTreeAlternativePlugin, { eventTypes } from 'main';
import * as FileTreeUtils from 'utils/Utils';
import * as recoilState from 'recoil/pluginState';
import { useRecoilState } from 'recoil';
import useForceUpdate from 'hooks/ForceUpdate';

interface MainTreeComponentProps {
    fileTreeView: FileTreeView;
    plugin: FileTreeAlternativePlugin;
}

type VaultChange = 'create' | 'delete' | 'rename' | 'modify';

export default function MainTreeComponent(props: MainTreeComponentProps) {
    // --> Main Variables
    const { plugin } = props;

    // --> Force Update Hook
    const forceUpdate = useForceUpdate();

    // --> Register Event Handlers
    plugin.registerEvent(plugin.app.vault.on('modify', (file) => handleVaultChanges(file, 'modify')));
    plugin.registerEvent(plugin.app.vault.on('rename', (file, oldPath) => handleVaultChanges(file, 'rename', oldPath)));
    plugin.registerEvent(plugin.app.vault.on('delete', (file) => handleVaultChanges(file, 'delete')));
    plugin.registerEvent(plugin.app.vault.on('create', (file) => handleVaultChanges(file, 'create')));

    // --> Plugin States
    const [view, setView] = useRecoilState(recoilState.view);
    const [activeFolderPath, setActiveFolderPath] = useRecoilState(recoilState.activeFolderPath);
    const [fileList, setFileList] = useRecoilState(recoilState.fileList);
    const [pinnedFiles, setPinnedFiles] = useRecoilState(recoilState.pinnedFiles);
    const [openFolders, setOpenFolders] = useRecoilState(recoilState.openFolders);
    const [_folderTree, setFolderTree] = useRecoilState(recoilState.folderTree);
    const [excludedFolders, setExcludedFolders] = useRecoilState(recoilState.excludedFolders);
    const [_folderFileCountMap, setFolderFileCountMap] = useRecoilState(recoilState.folderFileCountMap);
    const [_excludedExtensions, setExcludedExtensions] = useRecoilState(recoilState.excludedExtensions);
    const [_showSubFolders, setShowSubFolders] = useRecoilState(recoilState.showSubFolders);
    const [focusedFolder, setFocusedFolder] = useRecoilState(recoilState.focusedFolder);
    const [activeFile, setActiveFile] = useRecoilState(recoilState.activeFile);

    const setNewFileList = (folderPath?: string) => {
        let filesPath = folderPath ? folderPath : activeFolderPath;
        setFileList(FileTreeUtils.getFilesUnderPath(filesPath, plugin));
    };

    const setInitialActiveFolderPath = () => {
        if (plugin.settings.evernoteView) {
            let previousActiveFolder = localStorage.getItem(plugin.keys.activeFolderPathKey);
            if (previousActiveFolder) {
                let folder = plugin.app.vault.getAbstractFileByPath(previousActiveFolder);
                if (folder && folder instanceof TFolder) {
                    setActiveFolderPath(folder.path);
                }
            }
        }
    };

    // --> Create Custom Event Handlers
    useEffect(() => {
        window.addEventListener(eventTypes.activeFileChange, changeActiveFile);
        window.addEventListener(eventTypes.refreshView, forceUpdate);
        window.addEventListener(eventTypes.revealFile, handleRevealFileEvent);
        return () => {
            window.removeEventListener(eventTypes.activeFileChange, changeActiveFile);
            window.removeEventListener(eventTypes.refreshView, forceUpdate);
            window.removeEventListener(eventTypes.revealFile, handleRevealFileEvent);
        };
    }, []);

    const changeActiveFile = (evt: Event) => {
        // @ts-ignore
        let filePath: string = evt.detail.filePath;
        let file = plugin.app.vault.getAbstractFileByPath(filePath);
        if (file) setActiveFile(file as TFile);
    };

    // Initial Load
    useEffect(() => {
        setInitialFocusedFolder();
        setExcludedFolders(getExcludedFolders());
        setExcludedExtensions(getExcludedExtensions());
        setPinnedFiles(getPinnedFilesFromSettings());
        setOpenFolders(getOpenFoldersFromSettings());
        setShowSubFolders(plugin.settings.showFilesFromSubFolders);
        setInitialActiveFolderPath();
        if (plugin.settings.folderCount) setFolderFileCountMap(FileTreeUtils.getFolderNoteCountMap(plugin));
    }, []);

    // Each Focused Folder Change triggers new folder tree build
    useEffect(() => {
        if (focusedFolder) {
            setFolderTree(FileTreeUtils.createFolderTree(focusedFolder));
            localStorage.setItem(plugin.keys.focusedFolder, focusedFolder.path);
        }
    }, [focusedFolder]);

    const setInitialFocusedFolder = () => {
        let localFocusedFolder = localStorage.getItem(plugin.keys.focusedFolder);
        if (localFocusedFolder) {
            let folder = plugin.app.vault.getAbstractFileByPath(localFocusedFolder);
            if (folder && folder instanceof TFolder) {
                setFocusedFolder(folder);
                return;
            }
        }
        setFocusedFolder(plugin.app.vault.getRoot());
    };

    // State Change Handlers
    useEffect(() => savePinnedFilesToSettings(), [pinnedFiles]);
    useEffect(() => saveOpenFoldersToSettings(), [openFolders]);
    useEffect(() => saveExcludedFoldersToSettings(), [excludedFolders]);

    // If activeFolderPath is set, it means it should go to 'file' view
    useEffect(() => {
        if (activeFolderPath !== '') {
            setNewFileList(activeFolderPath);
            setView('file');
        }
        localStorage.setItem(plugin.keys.activeFolderPathKey, activeFolderPath);
    }, [activeFolderPath]);

    // Load Excluded Extensions as State
    function getExcludedExtensions(): string[] {
        let extensionsString: string = plugin.settings.excludedExtensions;
        let excludedExtensions: string[] = [];
        for (let extension of extensionsString.split(',')) {
            excludedExtensions.push(extension.trim());
        }
        return excludedExtensions;
    }

    // Load Excluded Folders
    function getExcludedFolders(): string[] {
        let excludedString: string = plugin.settings.excludedFolders;
        let excludedFolders: string[] = [];
        if (excludedString) {
            for (let excludedFolder of excludedString.split(',')) {
                if (excludedFolder !== '') excludedFolders.push(excludedFolder.trim());
            }
        }
        return excludedFolders;
    }

    // Load The String List and Set Open Folders State
    function getOpenFoldersFromSettings(): string[] {
        let openFolders: string[] = [];
        let localStorageOpenFolders = localStorage.getItem(plugin.keys.openFoldersKey);
        if (localStorageOpenFolders) {
            localStorageOpenFolders = JSON.parse(localStorageOpenFolders);
            for (let folder of localStorageOpenFolders) {
                let openFolder = plugin.app.vault.getAbstractFileByPath(folder);
                if (openFolder) openFolders.push(openFolder.path);
            }
        }
        return openFolders;
    }

    // Load The String List anad Set Pinned Files State
    function getPinnedFilesFromSettings(): TFile[] {
        let pinnedFiles: TFile[] = [];
        let localStoragePinnedFiles = localStorage.getItem(plugin.keys.pinnedFilesKey);
        if (localStoragePinnedFiles) {
            localStoragePinnedFiles = JSON.parse(localStoragePinnedFiles);
            for (let file of localStoragePinnedFiles) {
                let pinnedFile = plugin.app.vault.getAbstractFileByPath(file);
                if (pinnedFile) pinnedFiles.push(pinnedFile as TFile);
            }
        }
        return pinnedFiles;
    }

    // Get The Folders State and Save in Data as String Array
    function saveOpenFoldersToSettings() {
        let openFoldersToSave: string[] = [];
        for (let folder of openFolders) {
            openFoldersToSave.push(folder);
        }
        localStorage.setItem(plugin.keys.openFoldersKey, JSON.stringify(openFoldersToSave));
    }

    // Get The Pinned Files State and Save in Data as String Array
    function savePinnedFilesToSettings() {
        let pinnedFilesToSave: string[] = [];
        for (let file of pinnedFiles) {
            pinnedFilesToSave.push(file.path);
        }
        localStorage.setItem(plugin.keys.pinnedFilesKey, JSON.stringify(pinnedFilesToSave));
    }

    // Save Excluded Folders to Settings as String
    function saveExcludedFoldersToSettings() {
        plugin.settings.excludedFolders = excludedFolders.length > 1 ? excludedFolders.join(', ') : excludedFolders[0];
        plugin.saveSettings();
    }

    // Function for Event Handlers
    function handleVaultChanges(file: TAbstractFile, changeType: VaultChange, oldPathBeforeRename?: string) {
        if (file instanceof TFile) {
            if (view === 'file') {
                if (changeType === 'rename' || changeType === 'modify' || changeType === 'delete') {
                    // If the file is modified but sorting is not last-update to not component update unnecessarily, return
                    if (changeType === 'modify' && !['last-update', 'file-size'].contains(plugin.settings.sortFilesBy)) return;
                    // If the file renamed or deleted or modified is in the current view, it will be updated
                    if (fileList.some((stateFile) => stateFile.path === file.path)) setNewFileList();
                } else if (changeType === 'create') {
                    if (file.path.match(new RegExp(activeFolderPath + '.*'))) setNewFileList();
                }
            }
        } else if (file instanceof TFolder) {
            setFolderTree(FileTreeUtils.createFolderTree(focusedFolder));
            // if active folder is renamed, activefolderpath needs to be refreshed
            if (changeType === 'rename' && oldPathBeforeRename && activeFolderPath === oldPathBeforeRename) {
                setActiveFolderPath(file.path);
            }
        }
        // After Each Vault Change Folder Count Map to Be Updated
        if (plugin.settings.folderCount && changeType !== 'modify') {
            setFolderFileCountMap(FileTreeUtils.getFolderNoteCountMap(plugin));
        }
    }

    // ******** REVEAL ACTIVE FILE FUNCTIONS ******** //
    // --> During file list change, it will scroll to the active file element
    useEffect(() => {
        if (activeFile && fileList.length > 0) scrollToFile(activeFile);
    }, [fileList]);

    // Custom Event Handler Function
    function handleRevealFileEvent(evt: Event) {
        // @ts-ignore
        const file: TFile = evt.detail.file;
        if (file && file instanceof TFile) {
            revealFileInFileTree(file);
        } else {
            new Notice('No active file');
        }
    }

    // Scrolling Functions
    function scrollToFile(fileToScroll: TFile) {
        const selector = `div.oz-file-tree-files div.oz-nav-file-title[data-path="${fileToScroll.path}"]`;
        const fileTitleElement = document.querySelector(selector);
        if (fileTitleElement) fileTitleElement.scrollIntoView(false);
    }

    function scrollToFolder(folder: TFolder) {
        const selector = `div.oz-folder-contents div.oz-folder-element[data-path="${folder.path}"]`;
        const folderElement = document.querySelector(selector);
        if (folderElement) folderElement.scrollIntoView(false);
    }

    // --> Handle Reveal Active File Button
    function revealFileInFileTree(fileToReveal: TFile) {
        // Get parent folder
        const parentFolder = fileToReveal.parent;

        // Focused Folder needs to be root for the reveal
        if (focusedFolder && focusedFolder.path !== '/') setFocusedFolder(plugin.app.vault.getRoot());

        // Obtain all folders that needs to be opened
        const getAllFoldersToOpen = (fileToReveal: TFile) => {
            let foldersToOpen: string[] = [];
            const recursiveFx = (folder: TFolder) => {
                foldersToOpen.push(folder.path);
                if (folder.parent) recursiveFx(folder.parent);
            };
            recursiveFx(fileToReveal.parent);
            return foldersToOpen;
        };

        // Sanity check - Parent to be folder and set required component states
        if (parentFolder instanceof TFolder) {
            // Set Active Folder - It will trigger auto file list update
            setActiveFolderPath(parentFolder.path);

            // Set active file to show in the list
            setActiveFile(fileToReveal);

            // Set openfolders to expand in the folder list
            const foldersToOpen = getAllFoldersToOpen(fileToReveal);
            let openFoldersSet = new Set([...openFolders, ...foldersToOpen]);
            setOpenFolders(Array.from(openFoldersSet));

            scrollToFile(fileToReveal);
            scrollToFolder(parentFolder);
        }
    }

    return (
        <React.Fragment>
            {view === 'folder' ? (
                <MainFolder plugin={plugin} />
            ) : plugin.settings.evernoteView ? (
                <SingleView plugin={plugin} />
            ) : (
                <FileComponent plugin={plugin} />
            )}
        </React.Fragment>
    );
}
