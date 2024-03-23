import React, { useMemo } from 'react';
import { TFolder, Menu } from 'obsidian';
import { FolderTree } from 'utils/types';
import FileTreeAlternativePlugin from 'main';
import Tree from 'components/FolderView/treeComponent/TreeComponent';
import { useRecoilState } from 'recoil';
import * as recoilState from 'recoil/pluginState';
import * as Util from 'utils/Utils';
import { VaultChangeModal, MoveSuggestionModal, ConfirmationModal } from 'modals';
import * as newFileUtils from 'utils/newFile';

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
    const [activeFolderPath, setActiveFolderPath] = useRecoilState(recoilState.activeFolderPath);
    const [excludedFolders, setExcludedFolders] = useRecoilState(recoilState.excludedFolders);
    const [focusedFolder, setFocusedFolder] = useRecoilState(recoilState.focusedFolder);
    const [folderFileCountMap] = useRecoilState(recoilState.folderFileCountMap);
    const [_view, setView] = useRecoilState(recoilState.view);

    const handleFolderNameClick = (folderPath: string) => setActiveFolderPath(folderPath);

    const focusOnFolder = (folder: TFolder) => {
        setFocusedFolder(folder);
        setActiveFolderPath(folder.path);
    };

    const getSortedFolderTree = (folderTree: FolderTree[]) => {
        let newTree: FolderTree[] = folderTree;
        newTree = newTree.sort((a, b) => {
            if (plugin.settings.sortFoldersBy === 'name') {
                return a.folder.name.localeCompare(b.folder.name, 'en', { numeric: true });
            } else if (plugin.settings.sortFoldersBy === 'item-number') {
                let aCount = folderFileCountMap[a.folder.path] ? folderFileCountMap[a.folder.path].closed : 0;
                let bCount = folderFileCountMap[b.folder.path] ? folderFileCountMap[b.folder.path].closed : 0;
                return bCount - aCount;
            }
        });
        return newTree;
    };

    const handleFolderContextMenu = (params: { event: MouseEvent | TouchEvent; folder: TFolder }) => {
        let { event, folder } = params;

        // Event Undefined Correction
        let e = event;
        if (event === undefined) e = window.event as MouseEvent;

        // Menu Items
        const folderMenu = new Menu();

        // Focus Items
        if (Util.hasChildFolder(folder)) {
            folderMenu.addItem((menuItem) => {
                menuItem
                    .setTitle('Focus on Folder')
                    .setIcon('zoomInIcon')
                    .onClick(() => focusOnFolder(folder));
            });
        }

        if (!focusedFolder.isRoot()) {
            folderMenu.addItem((menuItem) => {
                menuItem
                    .setTitle('Focus Back to Root')
                    .setIcon('zoomOutIcon')
                    .onClick(() => focusOnFolder(rootFolder));
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
                    let confirmationModal = new ConfirmationModal(
                        plugin,
                        `Are you sure you want to delete folder "${folder.name}" and all folders & files under it?`,
                        () => {
                            let deleteOption = plugin.settings.deleteFileOption;
                            if (deleteOption === 'permanent') {
                                plugin.app.vault.delete(folder, true);
                            } else if (deleteOption === 'system-trash') {
                                plugin.app.vault.trash(folder, true);
                            } else if (deleteOption === 'trash') {
                                plugin.app.vault.trash(folder, false);
                            }
                            if (activeFolderPath === folder.path) {
                                setActiveFolderPath('');
                                setView('folder');
                            }
                        }
                    );
                    confirmationModal.open();
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

        folderMenu.addItem((menuItem) => {
            menuItem
                .setTitle('New File')
                .setIcon('document')
                .onClick((ev: MouseEvent) => {
                    Util.createNewFile(ev as unknown as React.MouseEvent<Element, MouseEvent>, folder.path, plugin);
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

        // Folder Note Open & Create & Delete (If folder note loaded, avoid duplicate create, delete buttons)
        const folderNotePath = `${folder.path}/${folder.name}.md`;
        let folderNoteExists = folder.children.some((f) => `${folder.name}.md` === f.name);

        if (folderNoteExists) {
            folderMenu.addItem((menuItem) => {
                menuItem
                    .setTitle('Open Folder Note')
                    .setIcon('go-to-file')
                    .onClick((ev: MouseEvent) => {
                        plugin.app.workspace.activeLeaf.setViewState({
                            type: 'markdown',
                            state: { file: folderNotePath },
                        });
                    });
            });
        }

        if (!Util.pluginIsLoaded(plugin.app, 'folder-note-core')) {
            // Delete Folder Note Button
            if (folderNoteExists) {
                folderMenu.addItem((menuItem) => {
                    menuItem
                        .setTitle('Delete Folder Note')
                        .setIcon('trash')
                        .onClick((ev: MouseEvent) => {
                            const folderNoteFile = plugin.app.vault.getAbstractFileByPath(folderNotePath);
                            if (folderNoteFile) plugin.app.vault.delete(folderNoteFile, true);
                        });
                });
            }
            // Create Folder Note Button
            else {
                folderMenu.addItem((menuItem) => {
                    menuItem
                        .setTitle('Create Folder Note')
                        .setIcon('create-new')
                        .onClick(async (ev: MouseEvent) => {
                            newFileUtils.createNewMarkdownFile(plugin, folder, folder.name, `# ${folder.name}`);
                        });
                });
            }
        }

        // Trigger
        app.workspace.trigger('file-menu', folderMenu, folder, 'file-explorer');
        if (e instanceof MouseEvent) {
            folderMenu.showAtPosition({ x: e.pageX, y: e.pageY });
        } else {
            folderMenu.showAtPosition({ x: 0, y: 0 });
        }
        return false;
    };

    if (!props.folderTree.children) return null;

    let sortedFolderTree = useMemo(
        () => getSortedFolderTree(props.folderTree.children),
        [props.folderTree.children, excludedFolders, plugin.settings.sortFoldersBy]
    );

    return (
        <React.Fragment>
            {Array.isArray(props.folderTree.children) &&
                sortedFolderTree.map((child) => {
                    return (
                        <React.Fragment key={child.folder.path}>
                            {child.children.length > 0 ? (
                                <Tree
                                    plugin={plugin}
                                    content={child.folder.name}
                                    open={openFolders.contains(child.folder.path)}
                                    onClick={() => handleFolderNameClick(child.folder.path)}
                                    onDoubleClick={() => focusOnFolder(child.folder)}
                                    onContextMenu={(e: MouseEvent | TouchEvent) =>
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
                                    onDoubleClick={() => focusOnFolder(child.folder)}
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
