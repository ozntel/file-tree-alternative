import React, { useEffect, useState } from 'react';
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
    const [folderTree, setFolderTree] = useState(null);

    useEffect(() => {
        setFolderTree(createFolderTree(rootFolder));
    }, [])

    const createFolderTree = (startFolder: TFolder) => {
        const fileTree: { folder: TFolder, children: any } = { folder: startFolder, children: [] }
        function recursive(folder: TFolder, object: { folder: TFolder, children: any }) {
            for (let child of folder.children) {
                if (child instanceof TFolder) {
                    let childFolder: TFolder = (child as TFolder);
                    let newObj: { folder: TFolder, children: any } = { folder: childFolder, children: [] }
                    object.children.push(newObj);
                    if (childFolder.children) recursive(childFolder, newObj);
                }
            }
        }
        recursive(startFolder, fileTree);
        return fileTree;
    }

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