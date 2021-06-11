import React from 'react';
import { App, Menu, TFolder, Modal, TFile } from 'obsidian';
import Tree from './treeComponent/TreeComponent';
import { FolderTree } from './MainComponent';

interface FolderProps {
    app: App,
    folderTree: FolderTree,
    activeFolderPath: string,
    setActiveFolderPath: Function,
    setView: Function
}

export function FolderComponent({ app, folderTree, activeFolderPath, setActiveFolderPath, setView }: FolderProps) {

    const treeStyles = { color: '--var(--text-muted)', fill: '#c16ff7', width: '100%', left: 10, top: 10 }

    return (
        <React.Fragment>
            <Tree content={app.vault.getName()} open style={treeStyles}>
                {
                    folderTree &&
                    <NestedChildrenComponent
                        app={app}
                        folderTree={folderTree}
                        activeFolderPath={activeFolderPath}
                        setActiveFolderPath={setActiveFolderPath}
                        setView={setView}
                    />
                }
            </Tree>
        </React.Fragment>
    )
}

/* ------ Nested Children Component ------ */

interface NestedChildrenComponentProps {
    app: App,
    folderTree: FolderTree,
    activeFolderPath: string,
    setActiveFolderPath: Function,
    setView: Function
}

function NestedChildrenComponent({ app, folderTree, activeFolderPath, setActiveFolderPath, setView }: NestedChildrenComponentProps) {
    if (!folderTree.children) return null;

    const handleFolderNameClick = (folderPath: string) => {
        setActiveFolderPath(folderPath);
    }

    const handleContextMenu = (event: MouseEvent, folder: TFolder) => {

        // Event Undefined Correction
        let e = event;
        if (event === undefined) e = (window.event as MouseEvent);

        // Menu Items
        const fileMenu = new Menu(app);
        fileMenu.addItem((menuItem) => {
            menuItem.setTitle('Delete');
            menuItem.setIcon('trash');
            menuItem.onClick((ev: MouseEvent) => {
                app.vault.delete(folder, true);
            })
        })

        fileMenu.addItem((menuItem) => {
            menuItem.setTitle('Rename');
            menuItem.setIcon('pencil');
            menuItem.onClick((ev: MouseEvent) => {
                let renameModal = new RenameModal(app, folder);
                renameModal.open()
            })
        })

        // Trigger
        app.workspace.trigger('file-menu', fileMenu, folder, 'file-explorer');
        fileMenu.showAtPosition({ x: e.pageX, y: e.pageY });
        return false;
    }

    const isTreeOpen = (fileName: string) => {
        if (activeFolderPath) return activeFolderPath.split('/').includes(fileName);
        return false;
    }

    return (
        <React.Fragment>
            {
                Array.isArray(folderTree.children) &&
                folderTree.children.map(child => {
                    return (
                        <React.Fragment key={child.folder.path}>
                            {
                                (child.folder as TFolder).children.some(child => child instanceof TFolder) ?
                                    <Tree content={child.folder.name} open={isTreeOpen(child.folder.name) ? true : false}
                                        onClick={() => handleFolderNameClick(child.folder.path)}
                                        onContextMenu={(e: MouseEvent) => handleContextMenu(e, child.folder)}
                                    >
                                        <NestedChildrenComponent
                                            app={app}
                                            folderTree={child}
                                            activeFolderPath={activeFolderPath}
                                            setActiveFolderPath={setActiveFolderPath}
                                            setView={setView}
                                        />
                                    </Tree>
                                    :
                                    <Tree content={child.folder.name}
                                        onClick={() => handleFolderNameClick(child.folder.path)}
                                        onContextMenu={(e: MouseEvent) => handleContextMenu(e, child.folder)}
                                    />
                            }
                        </React.Fragment>
                    )
                })
            }
        </React.Fragment>
    )
}

class RenameModal extends Modal {

    file: TFolder | TFile;

    constructor(app: App, file: TFolder | TFile) {
        super(app);
        this.file = file;
    }

    onOpen() {
        let { contentEl } = this;
        let myModal = this;
        // Header
        const headerEl = contentEl.createEl('h3', { text: 'Rename: Provide New Name' })

        // Input El
        const inputEl = contentEl.createEl('input')
        inputEl.style.cssText = 'width: 100%; height: 2.5em; margin-bottom: 15px;'
        inputEl.value = this.file.name;

        // Buttons
        const changeButton = contentEl.createEl('button', { text: 'Change' });
        const cancelButton = contentEl.createEl('button', { text: 'Cancel' });
        cancelButton.style.cssText = 'float: right;';

        // Event Listener
        changeButton.addEventListener('click', () => {
            let newName = inputEl.value;
            this.app.fileManager.renameFile(this.file, this.file.parent.path + '/' + newName);
            myModal.close()
        })

        cancelButton.addEventListener('click', () => {
            myModal.close();
        })
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}