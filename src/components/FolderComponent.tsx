import React from 'react';
import { App, Menu, TFolder } from 'obsidian';
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
        // let titleEl: HTMLElement = explorer.view.fileItems[folder.path].titleEl;
        let e = event;
        if (event === undefined) e = (window.event as MouseEvent);
        const fileMenu = new Menu(app);
        app.workspace.trigger('file-menu', fileMenu, folder, 'link-context-menu');
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