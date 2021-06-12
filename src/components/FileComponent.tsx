import React, { useState } from 'react';
// @ts-ignore
import { TFile, Menu, Keymap } from 'obsidian';
import { FileTreeView } from 'src/FileTreeView';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle, faArrowCircleLeft, faThumbtack } from '@fortawesome/free-solid-svg-icons'
import { VaultChangeModal } from '../modals';
import FileTreeAlternativePlugin from '../main';

interface FilesProps {
    plugin: FileTreeAlternativePlugin,
    fileList: TFile[],
    activeFolderPath: string,
    fileTreeView: FileTreeView,
    setView: Function,
    pinnedFiles: TFile[],
    setPinnedFiles: Function
}

export function FileComponent({ plugin, fileList, activeFolderPath, fileTreeView, setView, pinnedFiles, setPinnedFiles }: FilesProps) {

    const [activeFile, setActiveFile] = useState(null);

    const openFile = (file: TFile, e: React.MouseEvent) => {
        plugin.app.workspace.openLinkText(file.path, "/", Keymap.isModifier(e, "Mod") || 1 === e.button);
        setActiveFile(file);
    }

    const triggerContextMenu = (file: TFile, e: React.MouseEvent) => {
        // Menu Items
        const fileMenu = new Menu(plugin.app);

        fileMenu.addItem((menuItem) => {
            menuItem.setIcon('pin');
            if (pinnedFiles.contains(file)) {
                menuItem.setTitle('Unpin');
            } else {
                menuItem.setTitle('Pin to Top');
            }
            menuItem.onClick((ev: MouseEvent) => {
                if (pinnedFiles.contains(file)) {
                    let newPinnedFiles = pinnedFiles.filter(pinnedFile => pinnedFile !== file);
                    setPinnedFiles(newPinnedFiles);
                } else {
                    setPinnedFiles([...pinnedFiles, file])
                }
            })
        })

        fileMenu.addItem((menuItem) => {
            menuItem.setTitle('Rename');
            menuItem.setIcon('pencil');
            menuItem.onClick((ev: MouseEvent) => {
                // @todo - Rename shouldn't include .md extension - Change Modal
                let vaultChangeModal = new VaultChangeModal(plugin.app, file, 'rename');
                vaultChangeModal.open()
            })
        })

        fileMenu.addItem((menuItem) => {
            menuItem.setTitle('Delete');
            menuItem.setIcon('trash');
            menuItem.onClick((ev: MouseEvent) => {
                plugin.app.vault.delete(file, true);
            })
        })

        // Trigger
        plugin.app.workspace.trigger('file-menu', fileMenu, file, 'file-explorer');
        fileMenu.showAtPosition({ x: e.pageX, y: e.pageY });
        return false;
    }

    const getFileNameAndExtension = (fullName: string) => {
        var index = fullName.lastIndexOf('.');
        return {
            fileName: fullName.substring(0, index),
            extension: fullName.substring(index + 1)
        }
    }

    const getFolderName = (folderPath: string) => {
        if (folderPath === '/') return plugin.app.vault.getName();
        let index = folderPath.lastIndexOf('/');
        if (index !== -1) return folderPath.substring(index + 1);
        return folderPath;
    }

    const customSort = (fileList: TFile[]) => {
        let sortedfileList = fileList.sort((a, b) => a.name.localeCompare(b.name));
        return sortedfileList.reduce((acc, element) => {
            if (pinnedFiles.contains(element)) {
                return [element, ...acc];
            } else {
                return [...acc, element];
            }
        }, [])
    }

    const createNewFile = async (e: React.MouseEvent, folderPath: string) => {
        let targetFolder = plugin.app.vault.getAbstractFileByPath(folderPath);
        if (!targetFolder) return;
        let modal = new VaultChangeModal(plugin.app, targetFolder, 'create note');
        modal.open();
    }

    const handleGoBack = (e: React.MouseEvent) => {
        setView('folder');
    }

    return (
        <React.Fragment>
            <div className="oz-explorer-container">
                <div className="oz-flex-container">
                    <div className="nav-action-button oz-nav-action-button">
                        <FontAwesomeIcon icon={faArrowCircleLeft} onClick={(e) => handleGoBack(e)} size="lg" />
                    </div>
                    <div className="nav-action-button oz-nav-action-button">
                        <FontAwesomeIcon icon={faPlusCircle} onClick={(e) => createNewFile(e, activeFolderPath)} size="lg" />
                    </div>
                </div>
                <div className="oz-file-tree-header">
                    {getFolderName(activeFolderPath)}
                </div>
                <div className="oz-file-tree-files">
                    {customSort(fileList).map(file => {
                        return (
                            <div className="nav-file oz-nav-file" key={file.path} onClick={(e) => openFile(file, e)} onContextMenu={(e) => triggerContextMenu(file, e)}>
                                <div className={'nav-file-title oz-nav-file-title' + (activeFile === file ? ' is-active' : '')} data-path={file.path}>
                                    {
                                        getFileNameAndExtension(file.name).extension !== 'md' &&
                                        <span className="nav-file-tag">
                                            {getFileNameAndExtension(file.name).extension}
                                        </span>
                                    }
                                    <div className="nav-file-title-content">
                                        {getFileNameAndExtension(file.name).fileName}
                                        {
                                            pinnedFiles.contains(file) &&
                                            <FontAwesomeIcon icon={faThumbtack} style={{ marginLeft: '3px', float: 'right' }} size="xs" />
                                        }
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </React.Fragment>
    )
}