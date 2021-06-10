import { App, TAbstractFile, TFile, TFolder } from 'obsidian';
import React, { useEffect, useState } from 'react';
import { FileComponent } from './FileComponent';
import { FolderComponent } from './FolderComponent';
import { FileTreeView } from '../FileTreeView';
import FileTreeAlternativePlugin from '../main';

interface MainTreeComponentProps {
    app: App,
    fileTreeView?: FileTreeView,
    plugin: FileTreeAlternativePlugin
}

interface MainTreeComponentState {
    view: string,
    activeFolderPath: string,
    fileList: TFile[]
}

export default class MainTreeComponent extends React.Component<MainTreeComponentProps, MainTreeComponentState> {

    state = {
        view: 'folder',
        activeFolderPath: '',
        fileList: [] as TFile[],
    }

    setView = (view: string) => {
        this.setState({ view });
    }

    setNewFileList = (folderPath?: string) => {
        let filesPath = folderPath ? folderPath : this.state.activeFolderPath;
        this.setState({
            fileList: getFilesUnderPath(filesPath, this.props.app)
        });
    }

    setActiveFolderPath = (activeFolderPath: string) => {
        // If activeFolderPath is set, it means it should go to 'file' view
        this.setState({ activeFolderPath: activeFolderPath });
        this.setNewFileList(activeFolderPath);
        this.setState({ view: 'file' });
    }

    componentDidMount() {
        console.log('Component Mounted')
        this.props.plugin.registerEvent(this.props.plugin.app.vault.on('rename', (file, oldPath) => {
            this.handleVaultChanges(file, 'rename');
        }))
        this.props.plugin.registerEvent(this.props.plugin.app.vault.on('delete', (file) => {
            this.handleVaultChanges(file, 'delete');
        }))
        this.props.plugin.registerEvent(this.props.plugin.app.vault.on('create', (file) => {
            this.handleVaultChanges(file, 'create');
        }))
    }

    handleVaultChanges = (file: TAbstractFile, changeType: string) => {
        if (file instanceof TFile) {
            if (this.state.view === 'file') {
                if (changeType === 'rename' || changeType === 'delete') {
                    // If the file renamed and deleted is in the current view, it will be updated
                    if (this.state.fileList.some(stateFile => stateFile.path === file.path)) {
                        this.setNewFileList();
                    }
                }
            }
        } else if (file instanceof TFolder) {
            if (this.state.view === 'folder') {

            }
        }
    }

    render() {
        return (
            <React.Fragment>
                {
                    this.state.view === 'folder' ?
                        <FolderComponent
                            app={this.props.app}
                            activeFolderPath={this.state.activeFolderPath}
                            setActiveFolderPath={this.setActiveFolderPath}
                            setView={this.setView}
                        />
                        :
                        <FileComponent
                            app={this.props.app}
                            fileList={this.state.fileList}
                            activeFolderPath={this.state.activeFolderPath}
                            fileTreeView={this.props.fileTreeView}
                            setView={this.setView}
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