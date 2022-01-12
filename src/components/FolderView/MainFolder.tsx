import React from 'react';
import Tree from 'components/FolderView/treeComponent/TreeComponent';
import FileTreeAlternativePlugin from 'main';
import ConditionalRootFolderWrapper from 'components/FolderView/ConditionalWrapper';
import { useRecoilState } from 'recoil';
import * as recoilState from 'recoil/pluginState';
import { NestedFolders } from 'components/FolderView/NestedFolders';
import { TFolder, Menu } from 'obsidian';
import { VaultChangeModal } from 'modals';

interface FolderProps {
    plugin: FileTreeAlternativePlugin;
}

export function MainFolder(props: FolderProps) {
    const treeStyles = { color: 'var(--text-muted)', fill: '#c16ff7', width: '100%' };
    const plugin = props.plugin;
    const app = plugin.app;
    const rootFolder = app.vault.getRoot();

    // Global States
    const [_activeFolderPath, setActiveFolderPath] = useRecoilState(recoilState.activeFolderPath);
    const [folderTree] = useRecoilState(recoilState.folderTree);
    const [focusedFolder, setFocusedFolder] = useRecoilState(recoilState.focusedFolder);

    const handleRootFolderContextMenu = (event: MouseEvent, folder: TFolder) => {
        // Event Undefined Correction
        let e = event;
        if (event === undefined) e = window.event as MouseEvent;

        // Menu Items
        const folderMenu = new Menu(app);

        folderMenu.addItem((menuItem) => {
            menuItem
                .setTitle('New Folder')
                .setIcon('folder')
                .onClick((ev: MouseEvent) => {
                    let vaultChangeModal = new VaultChangeModal(plugin, folder, 'create folder');
                    vaultChangeModal.open();
                });
        });

        if (!folder.isRoot()) {
            folderMenu.addItem((menuItem) => {
                menuItem
                    .setTitle('Focus Back to Root')
                    .setIcon('zoomOutDoubleIcon')
                    .onClick(() => setFocusedFolder(rootFolder));
            });
        }

        if (folder.parent && !folder.parent.isRoot() && folder.parent !== focusedFolder) {
            folderMenu.addItem((menuItem) => {
                menuItem
                    .setTitle('Focus to Parent Folder')
                    .setIcon('zoomOutIcon')
                    .onClick(() => setFocusedFolder(folder.parent));
            });
        }

        // Trigger
        app.workspace.trigger('root-folder-menu', folderMenu, folder);
        folderMenu.showAtPosition({ x: e.pageX, y: e.pageY });
        return false;
    };

    return (
        <div className="oz-folders-tree-wrapper">
            <ConditionalRootFolderWrapper
                condition={(focusedFolder && !focusedFolder.isRoot()) || (focusedFolder && focusedFolder.isRoot && plugin.settings.showRootFolder)}
                wrapper={(children) => {
                    return (
                        <Tree
                            plugin={plugin}
                            content={focusedFolder.isRoot() ? plugin.app.vault.getName() : focusedFolder.name}
                            open
                            isRootFolder={focusedFolder.isRoot()}
                            style={treeStyles}
                            onClick={() => setActiveFolderPath(focusedFolder.path)}
                            folder={focusedFolder}
                            onContextMenu={(e: MouseEvent) => handleRootFolderContextMenu(e, focusedFolder)}>
                            {children}
                        </Tree>
                    );
                }}>
                {folderTree && <NestedFolders plugin={plugin} folderTree={folderTree} />}
            </ConditionalRootFolderWrapper>
        </div>
    );
}
