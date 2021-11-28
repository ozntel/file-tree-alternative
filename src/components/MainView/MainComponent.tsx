import { TAbstractFile, TFile, TFolder } from 'obsidian';
import React, { useEffect } from 'react';
import { FileComponent } from 'components/FileView/FileComponent';
import { MainFolder } from 'components/FolderView/MainFolder';
import { SingleView } from 'components/MainView/SingleView';
import { FileTreeView } from 'FileTreeView';
import FileTreeAlternativePlugin from 'main';
import * as FileTreeUtils from 'utils/Utils';
import * as recoilState from '../../recoil/pluginState';
import { useRecoilState } from 'recoil';

interface MainTreeComponentProps {
    fileTreeView: FileTreeView;
    plugin: FileTreeAlternativePlugin;
}

export default function MainTreeComponent(props: MainTreeComponentProps) {
    // --> Main Variables
    const { plugin } = props;

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
    const [_activeFile, setActiveFile] = useRecoilState(recoilState.activeFile);

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
        window.addEventListener('file-tree-alternative-active-file-change', changeActiveFile);
        return () => {
            window.removeEventListener('file-tree-alternative-active-file-change', changeActiveFile);
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
        for (let excludedFolder of excludedString.split(',')) {
            excludedFolders.push(excludedFolder.trim());
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
        plugin.settings.excludedFolders = excludedFolders.join(', ');
        plugin.saveSettings();
    }

    // Function for Event Handlers
    function handleVaultChanges(file: TAbstractFile, changeType: string, oldPathBeforeRename?: string) {
        if (file instanceof TFile) {
            if (view === 'file') {
                if (changeType === 'rename' || changeType === 'modify' || changeType === 'delete') {
                    // If the file is modified but sorting is not last-update to not component update unnecessarily, return
                    if (changeType === 'modify' && plugin.settings.sortFilesBy !== 'last-update') return;
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
        if (plugin.settings.folderCount) setFolderFileCountMap(FileTreeUtils.getFolderNoteCountMap(plugin));
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
