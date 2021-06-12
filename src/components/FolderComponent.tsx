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
    setOpenFolders: Function,
    excludedFolders: string[],
    folderFileCountMap: { [key: string]: number },
}

export function FolderComponent({ plugin, folderTree, activeFolderPath, setActiveFolderPath, setView, openFolders, setOpenFolders, excludedFolders, folderFileCountMap }: FolderProps) {

    const treeStyles = { color: '--var(--text-muted)', fill: '#c16ff7', width: '100%', left: 10, top: 10 }

    const handleFolderNameClick = (folderPath: string) => {
        setActiveFolderPath(folderPath);
    }

    return (
        <React.Fragment>
            <Tree
                content={plugin.app.vault.getName()}
                open style={treeStyles}
                onClick={() => handleFolderNameClick('/')}
                setOpenFolders={setOpenFolders}
                openFolders={openFolders}
                folder={plugin.app.vault.getRoot()}
                folderFileCountMap={folderFileCountMap}
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
                        excludedFolders={excludedFolders}
                        folderFileCountMap={folderFileCountMap}
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
    excludedFolders: string[],
    folderFileCountMap: { [key: string]: number },
}

function NestedChildrenComponent({ plugin, folderTree, activeFolderPath, setActiveFolderPath, setView, openFolders, setOpenFolders, excludedFolders, folderFileCountMap }: NestedChildrenComponentProps) {
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
        let newTree: FolderTree[];
        if (excludedFolders.length > 0) newTree = folderTree.filter(tree => !excludedFolders.contains(tree.folder.path));
        newTree = newTree.sort((a, b) => a.folder.name.localeCompare(b.folder.name))
        return newTree
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
                                        folderFileCountMap={folderFileCountMap}
                                    >
                                        <NestedChildrenComponent
                                            plugin={plugin}
                                            folderTree={child}
                                            activeFolderPath={activeFolderPath}
                                            setActiveFolderPath={setActiveFolderPath}
                                            setView={setView}
                                            openFolders={openFolders}
                                            setOpenFolders={setOpenFolders}
                                            excludedFolders={excludedFolders}
                                            folderFileCountMap={folderFileCountMap}
                                        />
                                    </Tree>
                                    :
                                    <Tree content={child.folder.name}
                                        onClick={() => handleFolderNameClick(child.folder.path)}
                                        onContextMenu={(e: MouseEvent) => handleContextMenu(e, child.folder)}
                                        setOpenFolders={setOpenFolders}
                                        openFolders={openFolders}
                                        folder={child.folder}
                                        folderFileCountMap={folderFileCountMap}
                                    />
                            }
                        </React.Fragment>
                    )
                })
            }
        </React.Fragment>
    )
}
