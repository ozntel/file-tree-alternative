import React from 'react';
import { Menu, TFolder } from 'obsidian';
import Tree from './treeComponent/TreeComponent';
import { FolderTree } from './MainComponent';
import { VaultChangeModal } from '../modals';
import FileTreeAlternativePlugin from '../main'

interface FolderProps {
    plugin: FileTreeAlternativePlugin,
    folderTree: FolderTree,
    activeFolderPath: string,
    setActiveFolderPath: Function,
    setView: Function
    openFolders: TFolder[],
    setOpenFolders: Function,
    excludedFolders: string[],
    folderFileCountMap: { [key: string]: number },
}

export class FolderComponent extends React.Component<FolderProps>{

    treeStyles = { color: '--var(--text-muted)', fill: '#c16ff7', width: '100%', left: 10, top: 10 }

    handleFolderNameClick = (folderPath: string) => {
        this.props.setActiveFolderPath(folderPath);
    }

    render() {
        return (
            <React.Fragment>
                <Tree
                    plugin={this.props.plugin}
                    content={this.props.plugin.app.vault.getName()}
                    open style={this.treeStyles}
                    onClick={() => this.handleFolderNameClick('/')}
                    setOpenFolders={this.props.setOpenFolders}
                    openFolders={this.props.openFolders}
                    folder={this.props.plugin.app.vault.getRoot()}
                    folderFileCountMap={this.props.folderFileCountMap}
                >
                    {
                        this.props.folderTree &&
                        <NestedChildrenComponent
                            plugin={this.props.plugin}
                            folderTree={this.props.folderTree}
                            activeFolderPath={this.props.activeFolderPath}
                            setActiveFolderPath={this.props.setActiveFolderPath}
                            setView={this.props.setView}
                            openFolders={this.props.openFolders}
                            setOpenFolders={this.props.setOpenFolders}
                            excludedFolders={this.props.excludedFolders}
                            folderFileCountMap={this.props.folderFileCountMap}
                        />
                    }
                </Tree>
            </React.Fragment>
        )
    }
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

class NestedChildrenComponent extends React.Component<NestedChildrenComponentProps>{

    handleFolderNameClick = (folderPath: string) => {
        this.props.setActiveFolderPath(folderPath);
    }

    handleContextMenu = (event: MouseEvent, folder: TFolder) => {

        // Event Undefined Correction
        let e = event;
        if (event === undefined) e = (window.event as MouseEvent);

        // Menu Items
        const fileMenu = new Menu(this.props.plugin.app);

        fileMenu.addItem((menuItem) => {
            menuItem.setTitle('New Folder');
            menuItem.setIcon('folder');
            menuItem.onClick((ev: MouseEvent) => {
                let vaultChangeModal = new VaultChangeModal(this.props.plugin.app, folder, 'create folder');
                vaultChangeModal.open();
            })
        })

        fileMenu.addItem((menuItem) => {
            menuItem.setTitle('Delete');
            menuItem.setIcon('trash');
            menuItem.onClick((ev: MouseEvent) => {
                this.props.plugin.app.vault.delete(folder, true);
            })
        })

        fileMenu.addItem((menuItem) => {
            menuItem.setTitle('Rename');
            menuItem.setIcon('pencil');
            menuItem.onClick((ev: MouseEvent) => {
                let vaultChangeModal = new VaultChangeModal(this.props.plugin.app, folder, 'rename');
                vaultChangeModal.open()
            })
        })

        // Trigger
        this.props.plugin.app.workspace.trigger('file-menu', fileMenu, folder, 'file-explorer');
        fileMenu.showAtPosition({ x: e.pageX, y: e.pageY });
        return false;
    }

    customSort = (folderTree: FolderTree[]) => {
        let newTree: FolderTree[];
        if (this.props.excludedFolders.length > 0) {
            newTree = folderTree.filter(tree => !this.props.excludedFolders.contains(tree.folder.path));
        }
        newTree = newTree.sort((a, b) => a.folder.name.localeCompare(b.folder.name, 'en', { numeric: true }))
        return newTree
    }

    render() {

        if (!this.props.folderTree.children) return null;

        return (
            <React.Fragment>
                {
                    Array.isArray(this.props.folderTree.children) &&
                    this.customSort(this.props.folderTree.children).map(child => {
                        return (
                            <React.Fragment key={child.folder.path}>
                                {
                                    (child.folder as TFolder).children.some(child => child instanceof TFolder) ?
                                        <Tree
                                            plugin={this.props.plugin}
                                            content={child.folder.name}
                                            open={this.props.openFolders.contains(child.folder) ? true : false}
                                            onClick={() => this.handleFolderNameClick(child.folder.path)}
                                            onContextMenu={(e: MouseEvent) => this.handleContextMenu(e, child.folder)}
                                            setOpenFolders={this.props.setOpenFolders}
                                            openFolders={this.props.openFolders}
                                            folder={child.folder}
                                            folderFileCountMap={this.props.folderFileCountMap}
                                        >
                                            <NestedChildrenComponent
                                                plugin={this.props.plugin}
                                                folderTree={child}
                                                activeFolderPath={this.props.activeFolderPath}
                                                setActiveFolderPath={this.props.setActiveFolderPath}
                                                setView={this.props.setView}
                                                openFolders={this.props.openFolders}
                                                setOpenFolders={this.props.setOpenFolders}
                                                excludedFolders={this.props.excludedFolders}
                                                folderFileCountMap={this.props.folderFileCountMap}
                                            />
                                        </Tree>
                                        :
                                        <Tree
                                            plugin={this.props.plugin}
                                            content={child.folder.name}
                                            onClick={() => this.handleFolderNameClick(child.folder.path)}
                                            onContextMenu={(e: MouseEvent) => this.handleContextMenu(e, child.folder)}
                                            setOpenFolders={this.props.setOpenFolders}
                                            openFolders={this.props.openFolders}
                                            folder={child.folder}
                                            folderFileCountMap={this.props.folderFileCountMap}
                                        />
                                }
                            </React.Fragment>
                        )
                    })
                }
            </React.Fragment>
        )
    }
}