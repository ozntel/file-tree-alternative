import React from 'react';
import { App, TFolder } from 'obsidian';
import Tree from './treeComponent/TreeComponent';

interface FolderProps {
    app: App,
    activeFolderPath: string,
    setActiveFolderPath: Function,
    setView: Function
}

export function FolderComponent({ app, activeFolderPath, setActiveFolderPath, setView }: FolderProps) {

    const rootFolder: TFolder = app.vault.getRoot()
    const treeStyles = { color: 'white', fill: 'white', width: '100%', left: 10, top: 10 }

    return (
        <React.Fragment>
            <Tree content={app.vault.getName()} open style={treeStyles}>
                <NestedChildrenComponent
                    folder={rootFolder}
                    activeFolderPath={activeFolderPath}
                    setActiveFolderPath={setActiveFolderPath}
                    setView={setView}
                />
            </Tree>
        </React.Fragment>
    )
}

/* ------ Nested Children Component ------ */

interface NestedChildrenComponentProps {
    folder: TFolder,
    activeFolderPath: string,
    setActiveFolderPath: Function,
    setView: Function
}

function NestedChildrenComponent({ folder, activeFolderPath, setActiveFolderPath, setView }: NestedChildrenComponentProps) {
    if (!folder.children) return null;

    const handleFolderNameClick = (folderPath: string) => {
        setActiveFolderPath(folderPath);
        setView('file');
    }

    const isTreeOpen = (fileName: string) => {
        if (activeFolderPath) return activeFolderPath.split('/').includes(fileName);
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
                                                activeFolderPath={activeFolderPath}
                                                setActiveFolderPath={setActiveFolderPath}
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