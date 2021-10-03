import React from 'react';
import { TFolder } from 'obsidian';
import { FolderTree } from 'utils/types';
import FileTreeAlternativePlugin from 'main';
import Tree from 'components/FolderView/treeComponent/TreeComponent';
import { useRecoilState } from 'recoil';
import * as recoilState from 'recoil/pluginState';
import { handleFolderContextMenu } from './FolderMenu';

interface NestedFoldersProps {
    plugin: FileTreeAlternativePlugin;
    folderTree: FolderTree;
}

export function NestedFolders(props: NestedFoldersProps) {
    const plugin = props.plugin;

    // Global States
    const [openFolders] = useRecoilState(recoilState.openFolders);
    const [activeFolderPath, setActiveFolderPath] = useRecoilState(recoilState.activeFolderPath);
    const [excludedFolders, setExcludedFolders] = useRecoilState(recoilState.excludedFolders);

    const handleFolderNameClick = (folderPath: string) => setActiveFolderPath(folderPath);

    const getSortedFolderTree = (folderTree: FolderTree[]) => {
        let newTree: FolderTree[] = folderTree;
        if (excludedFolders.length > 0) {
            newTree = newTree.filter((tree) => !excludedFolders.contains(tree.folder.path));
        }
        newTree = newTree.sort((a, b) => a.folder.name.localeCompare(b.folder.name, 'en', { numeric: true }));
        return newTree;
    };

    if (!props.folderTree.children) return null;

    return (
        <React.Fragment>
            {Array.isArray(props.folderTree.children) &&
                getSortedFolderTree(props.folderTree.children).map((child) => {
                    return (
                        <React.Fragment key={child.folder.path}>
                            {(child.folder as TFolder).children.some((child) => child instanceof TFolder) ? (
                                <Tree
                                    plugin={plugin}
                                    content={child.folder.name}
                                    open={openFolders.contains(child.folder) ? true : false}
                                    onClick={() => handleFolderNameClick(child.folder.path)}
                                    onContextMenu={(e: MouseEvent) =>
                                        handleFolderContextMenu(e, child.folder, plugin.app, excludedFolders, setExcludedFolders)
                                    }
                                    folder={child.folder}>
                                    <NestedFolders plugin={plugin} folderTree={child} />
                                </Tree>
                            ) : (
                                <Tree
                                    plugin={plugin}
                                    content={child.folder.name}
                                    onClick={() => handleFolderNameClick(child.folder.path)}
                                    onContextMenu={(e: MouseEvent) =>
                                        handleFolderContextMenu(e, child.folder, plugin.app, excludedFolders, setExcludedFolders)
                                    }
                                    folder={child.folder}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
        </React.Fragment>
    );
}
