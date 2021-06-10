import React, { useEffect, useState } from 'react';
import { App, TFolder } from 'obsidian';
import Tree from './treeComponent/TreeComponent';

interface FolderProps {
    app: App,
    activeFolderPath: string,
    setActiveFolderPath: Function,
    setView: Function
}

interface FolderTree {
    folder: TFolder,
    children: FolderTree[]
}

export function FolderComponent({ app, activeFolderPath, setActiveFolderPath, setView }: FolderProps) {

    const rootFolder: TFolder = app.vault.getRoot()
    const treeStyles = { color: 'white', fill: 'white', width: '100%', left: 10, top: 10 }
    const [folderTree, setFolderTree] = useState<FolderTree>(null);

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
                {
                    folderTree &&
                    <NestedChildrenComponent
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
    folderTree: FolderTree,
    activeFolderPath: string,
    setActiveFolderPath: Function,
    setView: Function
}

function NestedChildrenComponent({ folderTree, activeFolderPath, setActiveFolderPath, setView }: NestedChildrenComponentProps) {
    if (!folderTree.children) return null;

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
                Array.isArray(folderTree.children) &&
                folderTree.children.map(child => {
                    return (
                        <React.Fragment key={child.folder.path}>
                            {
                                (child.folder as TFolder).children.some(child => child instanceof TFolder) ?
                                    <Tree content={child.folder.name} open={isTreeOpen(child.folder.name) ? true : false} onClick={() => handleFolderNameClick(child.folder.path)}>
                                        <NestedChildrenComponent
                                            folderTree={child}
                                            activeFolderPath={activeFolderPath}
                                            setActiveFolderPath={setActiveFolderPath}
                                            setView={setView}
                                        />
                                    </Tree>
                                    :
                                    <Tree content={child.folder.name} onClick={() => handleFolderNameClick(child.folder.path)} />
                            }
                        </React.Fragment>
                    )
                })
            }
        </React.Fragment>
    )
}