import React, { useState } from 'react';
import { App, Menu, TFolder } from 'obsidian';
import Tree from './treeComponent/TreeComponent';
import { FolderTree } from './MainComponent';
import { VaultChangeModal } from '../modals';
import FileTreeAlternativePlugin from '../main'

interface FolderProps {
    plugin: FileTreeAlternativePlugin;
    folderTree: FolderTree,
    activeFolderPath: string,
    setActiveFolderPath: Function,
    setView: Function
    openFolders: TFolder[],
    setOpenFolders: Function
}

export function FolderComponent({ plugin, folderTree, activeFolderPath, setActiveFolderPath, setView, openFolders, setOpenFolders }: FolderProps) {

    const treeStyles = { color: '--var(--text-muted)', fill: '#c16ff7', width: '100%', left: 10, top: 10 }

    return (
        <React.Fragment>
            <Tree
                content={plugin.app.vault.getName()}
                open style={treeStyles}
                setOpenFolders={setOpenFolders}
                openFolders={openFolders}
                folder={plugin.app.vault.getRoot()}
            >
                {
                    folderTree &&
                    <NestedChildrenComponent
                        plugin={plugin}
                        folderTree={folderTree}
                        activeFolderPath={activeFolderPath}
                        setActiveFolderPath={setActiveFolderPath}
                        setView={setView}
                        openFolders={openFolders}
                        setOpenFolders={setOpenFolders}
                    />
                }
            </Tree>
        </React.Fragment>
    )
}

/* ------ Nested Children Component ------ */

interface NestedChildrenComponentProps {
    plugin: FileTreeAlternativePlugin,
    folderTree: FolderTree,
    activeFolderPath: string,
    setActiveFolderPath: Function,
    setView: Function,
    openFolders: TFolder[],
    setOpenFolders: Function,
}

function NestedChildrenComponent({ plugin, folderTree, activeFolderPath, setActiveFolderPath, setView, openFolders, setOpenFolders }: NestedChildrenComponentProps) {
    if (!folderTree.children) return null;

    const handleFolderNameClick = (folderPath: string) => {
        setActiveFolderPath(folderPath);
    }

    const handleContextMenu = (event: MouseEvent, folder: TFolder) => {

        // Event Undefined Correction
        let e = event;
        if (event === undefined) e = (window.event as MouseEvent);

        // Menu Items
        const fileMenu = new Menu(plugin.app);

        fileMenu.addItem((menuItem) => {
            menuItem.setTitle('New Folder');
            menuItem.setIcon('folder');
            menuItem.onClick((ev: MouseEvent) => {
                let vaultChangeModal = new VaultChangeModal(plugin.app, folder, 'create folder');
                vaultChangeModal.open();
            })
        })

        fileMenu.addItem((menuItem) => {
            menuItem.setTitle('Delete');
            menuItem.setIcon('trash');
            menuItem.onClick((ev: MouseEvent) => {
                plugin.app.vault.delete(folder, true);
            })
        })

        fileMenu.addItem((menuItem) => {
            menuItem.setTitle('Rename');
            menuItem.setIcon('pencil');
            menuItem.onClick((ev: MouseEvent) => {
                let vaultChangeModal = new VaultChangeModal(plugin.app, folder, 'rename');
                vaultChangeModal.open()
            })
        })

        // Trigger
        plugin.app.workspace.trigger('file-menu', fileMenu, folder, 'file-explorer');
        fileMenu.showAtPosition({ x: e.pageX, y: e.pageY });
        return false;
    }

    const customSort = (folderTree: FolderTree[]) => {
        return folderTree.sort((a, b) => a.folder.name.localeCompare(b.folder.name))
    }

    return (
        <React.Fragment>
            {
                Array.isArray(folderTree.children) &&
                customSort(folderTree.children).map(child => {
                    return (
                        <React.Fragment key={child.folder.path}>
                            {
                                (child.folder as TFolder).children.some(child => child instanceof TFolder) ?
                                    <Tree
                                        content={child.folder.name}
                                        open={openFolders.contains(child.folder) ? true : false}
                                        onClick={() => handleFolderNameClick(child.folder.path)}
                                        onContextMenu={(e: MouseEvent) => handleContextMenu(e, child.folder)}
                                        setOpenFolders={setOpenFolders}
                                        openFolders={openFolders}
                                        folder={child.folder}
                                    >
                                        <NestedChildrenComponent
                                            plugin={plugin}
                                            folderTree={child}
                                            activeFolderPath={activeFolderPath}
                                            setActiveFolderPath={setActiveFolderPath}
                                            setView={setView}
                                            openFolders={openFolders}
                                            setOpenFolders={setOpenFolders}
                                        />
                                    </Tree>
                                    :
                                    <Tree content={child.folder.name}
                                        onClick={() => handleFolderNameClick(child.folder.path)}
                                        onContextMenu={(e: MouseEvent) => handleContextMenu(e, child.folder)}
                                        setOpenFolders={setOpenFolders}
                                        openFolders={openFolders}
                                        folder={child.folder}
                                    />
                            }
                        </React.Fragment>
                    )
                })
            }
        </React.Fragment>
    )
}
