import { App, TAbstractFile, TFile, TFolder } from 'obsidian';
import React from 'react';
import { FileComponent } from './FileComponent';
import { FolderComponent } from './FolderComponent';
import { FileTreeView } from '../FileTreeView';
import FileTreeAlternativePlugin from '../main';

interface MainTreeComponentProps {
    fileTreeView: FileTreeView,
    plugin: FileTreeAlternativePlugin
}

interface MainTreeComponentState {
    view: string,
    activeFolderPath: string,
    fileList: TFile[],
    pinnedFiles: TFile[],
    openFolders: TFolder[]
    folderTree: FolderTree
}

export interface FolderTree {
    folder: TFolder,
    children: FolderTree[]
}

export default class MainTreeComponent extends React.Component<MainTreeComponentProps, MainTreeComponentState> {

    state = {
        view: 'folder',
        activeFolderPath: '',
        fileList: [] as TFile[],
        pinnedFiles: [] as TFile[],
        openFolders: [] as TFolder[],
        folderTree: null as FolderTree,
    }

    rootFolder: TFolder = this.props.plugin.app.vault.getRoot()

    setView = (view: string) => this.setState({ view });

    setPinnedFiles = (pinnedFiles: TFile[]) => this.setState({ pinnedFiles });

    setNewFileList = (folderPath?: string) => {
        let filesPath = folderPath ? folderPath : this.state.activeFolderPath;
        this.setState({ fileList: getFilesUnderPath(filesPath, this.props.plugin.app) });
    }

    // Folder Component to Set Expanded Folders
    setOpenFolders = (openFolders: TFolder[]) => {
        this.setState({ openFolders });
    }

    // Function used for File View
    setActiveFolderPath = (activeFolderPath: string) => {
        // If activeFolderPath is set, it means it should go to 'file' view
        this.setState({ activeFolderPath: activeFolderPath });
        this.setNewFileList(activeFolderPath);
        this.setState({ view: 'file' });
    }

    // Load The String List and Set Open Folders State
    loadOpenFoldersFromSettings() {
        let openFolders: TFolder[] = [];
        for (let folder of this.props.plugin.settings.openFolders) {
            let openFolder = this.props.plugin.app.vault.getAbstractFileByPath(folder);
            if (openFolder) openFolders.push((openFolder as TFolder));
        }
        this.setState({ openFolders })
    }

    // Load The String List anad Set Pinned Files State
    loadPinnedFilesFromSettings() {
        let pinnedFiles: TFile[] = [];
        for (let file of this.props.plugin.settings.pinnedFiles) {
            let pinnedFile = this.props.plugin.app.vault.getAbstractFileByPath(file);
            if (pinnedFile) pinnedFiles.push((pinnedFile as TFile));
        }
        this.setState({ pinnedFiles });
    }

    // Get The Folders State and Save in Data as String Array
    saveOpenFoldersToSettings() {
        let openFolders: string[] = [];
        for (let folder of this.state.openFolders) {
            openFolders.push(folder.path);
        }
        this.props.plugin.settings.openFolders = openFolders;
        this.props.plugin.saveSettings();
    }

    // Get The Pinned Files State and Save in Data as String Array
    savePinnedFilesToSettings() {
        let pinnedFiles: string[] = [];
        for (let file of this.state.pinnedFiles) {
            pinnedFiles.push(file.path);
        }
        this.props.plugin.settings.pinnedFiles = pinnedFiles;
        this.props.plugin.saveSettings();
    }

    // First Time Compount Mount
    componentDidMount() {
        console.log('File Tree Component Mounted')
        // Set the Folder Tree
        this.setState({ folderTree: createFolderTree(this.rootFolder) });
        // Set/Remember Open Folders from Last Session
        this.loadOpenFoldersFromSettings();
        // Set/Remember Pinned Files
        this.loadPinnedFilesFromSettings();
        // Register Vault Events
        this.props.plugin.registerEvent(this.props.plugin.app.vault.on('rename', (file, oldPath) => this.handleVaultChanges(file, 'rename')));
        this.props.plugin.registerEvent(this.props.plugin.app.vault.on('delete', (file) => this.handleVaultChanges(file, 'delete')));
        this.props.plugin.registerEvent(this.props.plugin.app.vault.on('create', (file) => this.handleVaultChanges(file, 'create')));
        // Workspace Quit to Save Last Status of Open Folders
        this.props.plugin.registerEvent(this.props.plugin.app.workspace.on('quit', () => this.saveOpenFoldersToSettings()))
    }

    // Before Compount Unmounted Save Last States
    componentWillUnmount = () => {
        this.saveOpenFoldersToSettings();
        this.savePinnedFilesToSettings();
    }

    // Function for Event Handlers
    handleVaultChanges = (file: TAbstractFile, changeType: string) => {
        if (file instanceof TFile) {
            if (this.state.view === 'file') {
                if (changeType === 'rename' || changeType === 'delete') {
                    // If the file renamed and deleted is in the current view, it will be updated
                    if (this.state.fileList.some(stateFile => stateFile.path === file.path)) {
                        this.setNewFileList();
                    }
                } else if (changeType === 'create') {
                    if (file.path.match(new RegExp(this.state.activeFolderPath + '.*'))) {
                        this.setNewFileList();
                    }
                }
            }
        } else if (file instanceof TFolder) {
            // @todo - After changes to keep the current view
            this.setState({ folderTree: createFolderTree(this.rootFolder) });
        }
    }

    render() {
        return (
            <React.Fragment>
                {
                    this.state.view === 'folder' ?
                        <FolderComponent
                            plugin={this.props.plugin}
                            folderTree={this.state.folderTree}
                            activeFolderPath={this.state.activeFolderPath}
                            setActiveFolderPath={this.setActiveFolderPath}
                            setView={this.setView}
                            openFolders={this.state.openFolders}
                            setOpenFolders={this.setOpenFolders}
                        />
                        :
                        <FileComponent
                            plugin={this.props.plugin}
                            fileList={this.state.fileList}
                            activeFolderPath={this.state.activeFolderPath}
                            fileTreeView={this.props.fileTreeView}
                            setView={this.setView}
                            pinnedFiles={this.state.pinnedFiles}
                            setPinnedFiles={this.setPinnedFiles}
                        />
                }
            </React.Fragment>
        )
    }
}

// Helper Function To Get List of Files
const getFilesUnderPath = (path: string, app: App): TFile[] => {
    var filesUnderPath: TFile[] = [];
    recursiveFx(path, app);
    function recursiveFx(path: string, app: App) {
        var folderObj = app.vault.getAbstractFileByPath(path);
        if (folderObj instanceof TFolder && folderObj.children) {
            for (let child of folderObj.children) {
                if (child instanceof TFile) filesUnderPath.push(child);
                if (child instanceof TFolder) recursiveFx(child.path, app);
            }
        }
    }
    return filesUnderPath;
}

// Helper Function to Create Folder Tree
const createFolderTree = (startFolder: TFolder) => {
    const fileTree: { folder: TFolder, children: any } = { folder: startFolder, children: [] }
    function recursive(folder: TFolder, object: { folder: TFolder, children: any }) {
        for (let child of folder.children) {
            if (child instanceof TFolder) {
                let childFolder: TFolder = (child as TFolder);
                let newObj: { folder: TFolder, children: any } = { folder: childFolder, children: [] }
                object.children.push(newObj);
                if (childFolder.children) recursive(childFolder, newObj);
            }
        }
    }
    recursive(startFolder, fileTree);
    return fileTree;
}