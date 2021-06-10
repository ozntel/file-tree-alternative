import React from 'react';
import { App, TFolder } from 'obsidian';
import Tree from './treeComponent/TreeComponent';

interface FolderProps {
    app: App,
    folderPath: string,
    setFolderPath: Function,
    setView: Function
}

export function FolderComponent({ app, folderPath, setFolderPath, setView }: FolderProps) {

    const rootFolder: TFolder = app.vault.getRoot()
    const treeStyles = { color: 'white', fill: 'white', width: '100%', left: 10, top: 10 }

    return (
        <React.Fragment>
            <Tree content={app.vault.getName()} open style={treeStyles}>
                <NestedChildrenComponent
                    folder={rootFolder}
                    folderPath={folderPath}
                    setFolderPath={setFolderPath}
                    setView={setView}
                />
            </Tree>
        </React.Fragment>
    )
}

/* ------ Nested Children Component ------ */

interface NestedChildrenComponentProps {
    folder: TFolder,
    folderPath: string,
    setFolderPath: Function,
    setView: Function
}

function NestedChildrenComponent({ folder, folderPath, setFolderPath, setView }: NestedChildrenComponentProps) {
    if (!folder.children) return null;

    const handleFolderNameClick = (folderPath: string) => {
        setFolderPath(folderPath);
        setView('file');
    }

    const isTreeOpen = (fileName: string) => {
        if (folderPath) return folderPath.split('/').includes(fileName);
        return false;
    }

    return (
        <React.Fragment>
            {
                Array.isArray(folder.children) &&
                folder.children.filter(child => child instanceof TFolder)
                    .map(child => {
                        return (
                            <React.Fragment key={child.path}>
                                {
                                    (child as TFolder).children.some(child => child instanceof TFolder) ?
                                        <Tree content={child.name} open={isTreeOpen(child.name) ? true : false} onClick={() => handleFolderNameClick(child.path)}>
                                            <NestedChildrenComponent
                                                folder={(child as TFolder)}
                                                folderPath={folderPath}
                                                setFolderPath={setFolderPath}
                                                setView={setView}
                                            />
                                        </Tree>
                                        :
                                        <Tree content={child.name} onClick={() => handleFolderNameClick(child.path)} />
                                }
                            </React.Fragment>
                        )
                    })
            }
        </React.Fragment>
    )
}