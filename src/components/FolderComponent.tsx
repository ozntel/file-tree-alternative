import React from 'react';
import { App, TFolder } from 'obsidian';
import Tree from './treeComponent/TreeComponent';

interface FolderProps {
    app: App,
    setFolderPath: Function,
    setView: Function
}

export function FolderComponent({ app, setFolderPath, setView }: FolderProps) {

    const rootFolder: TFolder = app.vault.getRoot()
    const treeStyles = { color: 'white', fill: 'white', width: '100%', left: 10, top: 10 }

    return (
        <React.Fragment>
            <Tree content={app.vault.getName()} open style={treeStyles}>
                <NestedChildrenComponent
                    folder={rootFolder}
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
    setFolderPath: Function,
    setView: Function
}

function NestedChildrenComponent({ folder, setFolderPath, setView }: NestedChildrenComponentProps) {
    if (!folder.children) return null;

    const handleFolderNameClick = (folderPath: string) => {
        setFolderPath(folderPath);
        setView('file');
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
                                        <Tree content={child.name} onClick={() => handleFolderNameClick(child.path)}>
                                            <NestedChildrenComponent
                                                folder={(child as TFolder)}
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