import React, { useMemo } from 'react';
import { TFolder, Menu } from 'obsidian';
import { FolderTree } from 'utils/types';
import FileTreeAlternativePlugin from 'main';
import Tree from 'components/FolderView/treeComponent/TreeComponent';
import { useRecoilState } from 'recoil';
import * as recoilState from 'recoil/pluginState';
import * as Util from 'utils/Utils';
import { VaultChangeModal, MoveSuggestionModal } from 'modals';

interface NestedFoldersProps {
    plugin: FileTreeAlternativePlugin;
    folderTree: FolderTree;
}

export function NestedFolders(props: NestedFoldersProps) {
    const plugin = props.plugin;
    const app = plugin.app;
    let rootFolder = app.vault.getRoot();

    // Global States
    const [openFolders] = useRecoilState(recoilState.openFolders);
    const [_activeFolderPath, setActiveFolderPath] = useRecoilState(recoilState.activeFolderPath);
    const [excludedFolders, setExcludedFolders] = useRecoilState(recoilState.excludedFolders);
    const [focusedFolder, setFocusedFolder] = useRecoilState(recoilState.focusedFolder);

    const handleFolderNameClick = (folderPath: string) => setActiveFolderPath(folderPath);

    const getSortedFolderTree = (folderTree: FolderTree[]) => {
        let newTree: FolderTree[] = folderTree;
        if (excludedFolders.length > 0) {
            newTree = newTree.filter((tree) => !excludedFolders.contains(tree.folder.path));
        }
        newTree = newTree.sort((a, b) => a.folder.name.localeCompare(b.folder.name, 'en', { numeric: true }));
        return newTree;
    };

    const handleFolderContextMenu = (params: { event: MouseEvent; folder: TFolder }) => {
        let { event, folder } = params;

        // Event Undefined Correction
        let e = event;
        if (event === undefined) e = window.event as MouseEvent;

        // Menu Items
        const folderMenu = new Menu(plugin.app);

        // Focus Items
        if (Util.hasChildFolder(folder)) {
            folderMenu.addItem((menuItem) => {
                menuItem
                    .setTitle('Focus on Folder')
                    .setIcon('zoomInIcon')
                    .onClick(() => setFocusedFolder(folder));
            });
        }

        if (!focusedFolder.isRoot()) {
            folderMenu.addItem((menuItem) => {
                menuItem
                    .setTitle('Focus Back to Root')
                    .setIcon('zoomOutIcon')
                    .onClick(() => setFocusedFolder(rootFolder));
            });
        }

        // CRUD Items
        folderMenu.addItem((menuItem) => {
            menuItem
                .setTitle('New Folder')
                .setIcon('folder')
                .onClick((ev: MouseEvent) => {
                    let vaultChangeModal = new VaultChangeModal(plugin, folder, 'create folder');
                    vaultChangeModal.open();
                });
        });

        folderMenu.addItem((menuItem) => {
            menuItem
                .setTitle('Delete')
                .setIcon('trash')
                .onClick((ev: MouseEvent) => {
                    plugin.app.vault.delete(folder, true);
                });
        });

        folderMenu.addItem((menuItem) => {
            menuItem
                .setTitle('Rename')
                .setIcon('pencil')
                .onClick((ev: MouseEvent) => {
                    let vaultChangeModal = new VaultChangeModal(plugin, folder, 'rename');
                    vaultChangeModal.open();
                });
        });

        // Move Item
        if (!Util.internalPluginLoaded('file-explorer', app)) {
            folderMenu.addItem((menuItem) => {
                menuItem
                    .setTitle('Move folder to...')
                    .setIcon('paper-plane')
                    .onClick((ev: MouseEvent) => {
                        let folderMoveModal = new MoveSuggestionModal(app, folder);
                        folderMoveModal.open();
                    });
            });
        }

        folderMenu.addItem((menuItem) => {
            menuItem
                .setTitle('Add to Excluded Folders')
                .setIcon('switch')
                .onClick((ev: MouseEvent) => {
                    setExcludedFolders([...excludedFolders, folder.path]);
                });
        });

        // Trigger
        app.workspace.trigger('file-menu', folderMenu, folder, 'file-explorer');
        folderMenu.showAtPosition({ x: e.pageX, y: e.pageY });
        return false;
    };

    if (!props.folderTree.children) return null;

    let sortedFolderTree = useMemo(() => getSortedFolderTree(props.folderTree.children), [props.folderTree.children, excludedFolders]);

    return (
        <React.Fragment>
            {Array.isArray(props.folderTree.children) &&
                sortedFolderTree.map((child) => {
                    return (
                        <React.Fragment key={child.folder.path}>
                            {(child.folder as TFolder).children.some((child) => child instanceof TFolder) ? (
                                <Tree
                                    plugin={plugin}
                                    content={child.folder.name}
                                    open={openFolders.contains(child.folder.path)}
                                    onClick={() => handleFolderNameClick(child.folder.path)}
                                    onContextMenu={(e: MouseEvent) =>
                                        handleFolderContextMenu({
                                            event: e,
                                            folder: child.folder,
                                        })
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
                                        handleFolderContextMenu({
                                            event: e,
                                            folder: child.folder,
                                        })
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
