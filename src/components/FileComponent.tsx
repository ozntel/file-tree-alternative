import React, { useState, useMemo, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
// @ts-ignore
import { TFile, Menu, Keymap } from 'obsidian';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle, faArrowCircleLeft, faThumbtack } from '@fortawesome/free-solid-svg-icons'
import { VaultChangeModal } from '../modals';
import FileTreeAlternativePlugin from '../main';

interface FilesProps {
    plugin: FileTreeAlternativePlugin,
    fileList: TFile[],
    activeFolderPath: string,
    setView: Function,
    pinnedFiles: TFile[],
    setPinnedFiles: Function,
    excludedExtensions: string[],
}

export function FileComponent({ plugin, fileList, activeFolderPath, setView, pinnedFiles, setPinnedFiles, excludedExtensions }: FilesProps) {

    const [activeFile, setActiveFile] = useState(null);

    // Scroll Top Once The File List is Loaded
    useEffect(() => {
        document.querySelector('div.workspace-leaf-content[data-type="file-tree-view"] > div.view-content').scrollTo(0, 0);
    }, [])

    // Drag Drop File Into File List to Load into Folder
    const { acceptedFiles, getRootProps, getInputProps, isDragActive } = useDropzone({ noClick: true });

    const files = acceptedFiles.map(async (file) => {
        file.arrayBuffer().then(arrayBuffer => {
            plugin.app.vault.adapter.writeBinary(activeFolderPath + '/' + file.name, arrayBuffer);
        })
    })

    const dragActiveStyle: React.CSSProperties = { backgroundColor: 'var(--text-selection)' }
    const dragStyle = useMemo(() => ({ ...(isDragActive ? dragActiveStyle : {}) }), [isDragActive]);
    const fullHeightStyle: React.CSSProperties = { width: '100%', height: '100%' }

    // Handle Click Event on File - Allows Open with Cmd/Ctrl
    const openFile = (file: TFile, e: React.MouseEvent) => {
        plugin.app.workspace.openLinkText(file.path, "/", Keymap.isModifier(e, "Mod") || 1 === e.button);
        setActiveFile(file);
    }

    // Handle Right Click Event on File - Custom Menu
    const triggerContextMenu = (file: TFile, e: React.MouseEvent) => {

        const fileMenu = new Menu(plugin.app);

        // Pin - Unpin Item
        fileMenu.addItem((menuItem) => {
            menuItem.setIcon('pin');
            if (pinnedFiles.contains(file)) menuItem.setTitle('Unpin');
            else menuItem.setTitle('Pin to Top');
            menuItem.onClick((ev: MouseEvent) => {
                if (pinnedFiles.contains(file)) {
                    let newPinnedFiles = pinnedFiles.filter(pinnedFile => pinnedFile !== file);
                    setPinnedFiles(newPinnedFiles);
                } else {
                    setPinnedFiles([...pinnedFiles, file])
                }
            })
        })

        // Rename Item
        fileMenu.addItem((menuItem) => {
            menuItem.setTitle('Rename');
            menuItem.setIcon('pencil');
            menuItem.onClick((ev: MouseEvent) => {
                let vaultChangeModal = new VaultChangeModal(plugin.app, file, 'rename');
                vaultChangeModal.open()
            })
        })

        // Delete Item
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

    // Files out of Md should be listed with extension badge - Md without extension
    const getFileNameAndExtension = (fullName: string) => {
        var index = fullName.lastIndexOf('.');
        return {
            fileName: fullName.substring(0, index),
            extension: fullName.substring(index + 1)
        }
    }

    // Convert Full Path to Final Folder Name
    const getFolderName = (folderPath: string) => {
        if (folderPath === '/') return plugin.app.vault.getName();
        let index = folderPath.lastIndexOf('/');
        if (index !== -1) return folderPath.substring(index + 1);
        return folderPath;
    }

    // Sort - Filter Files Depending on Preferences
    const customFiles = (fileList: TFile[]) => {
        let sortedfileList: TFile[];
        if (excludedExtensions.length > 0) sortedfileList = fileList.filter(file => !excludedExtensions.contains(file.extension));
        sortedfileList = sortedfileList.sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
        if (pinnedFiles.length > 0) {
            sortedfileList = sortedfileList.reduce((acc, element) => {
                if (pinnedFiles.contains(element)) return [element, ...acc];
                return [...acc, element];
            }, [])
        }
        return sortedfileList
    }

    // Handle Plus Button - Opens Modal to Create a New File
    const createNewFile = async (e: React.MouseEvent, folderPath: string) => {
        let targetFolder = plugin.app.vault.getAbstractFileByPath(folderPath);
        if (!targetFolder) return;
        let modal = new VaultChangeModal(plugin.app, targetFolder, 'create note');
        modal.open();
    }

    // Go Back Button - Sets Main Component View to Folder
    const handleGoBack = (e: React.MouseEvent) => {
        setView('folder');
    }

    return (
        <React.Fragment>
            <div className="oz-explorer-container" style={fullHeightStyle}>

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

                <div {...getRootProps()} style={{ ...fullHeightStyle, ...dragStyle }}>

                    <input {...getInputProps()} />

                    <div className={"oz-file-tree-files " + (isDragActive && "drag-entered")}>
                        {customFiles(fileList).map(file => {
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

            </div>
        </React.Fragment>
    )
}