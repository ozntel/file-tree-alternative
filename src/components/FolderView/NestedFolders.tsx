import React from 'react';
import { Menu, TFolder } from 'obsidian';
import { FolderTree } from 'utils/types';
import { VaultChangeModal } from 'modals';
import FileTreeAlternativePlugin from 'main';
import Tree from 'components/FolderView/treeComponent/TreeComponent';
import { useRecoilState } from 'recoil';
import * as recoilState from 'recoil/pluginState';

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

	const handleContextMenu = (event: MouseEvent, folder: TFolder) => {
		// Event Undefined Correction
		let e = event;
		if (event === undefined) e = window.event as MouseEvent;

		// Menu Items
		const fileMenu = new Menu(plugin.app);

		fileMenu.addItem((menuItem) => {
			menuItem.setTitle('New Folder');
			menuItem.setIcon('folder');
			menuItem.onClick((ev: MouseEvent) => {
				let vaultChangeModal = new VaultChangeModal(plugin.app, folder, 'create folder');
				vaultChangeModal.open();
			});
		});

		fileMenu.addItem((menuItem) => {
			menuItem.setTitle('Delete');
			menuItem.setIcon('trash');
			menuItem.onClick((ev: MouseEvent) => {
				plugin.app.vault.delete(folder, true);
			});
		});

		fileMenu.addItem((menuItem) => {
			menuItem.setTitle('Rename');
			menuItem.setIcon('pencil');
			menuItem.onClick((ev: MouseEvent) => {
				let vaultChangeModal = new VaultChangeModal(plugin.app, folder, 'rename');
				vaultChangeModal.open();
			});
		});

		fileMenu.addItem((menuItem) => {
			menuItem.setTitle('Add to Excluded Folders');
			menuItem.setIcon('switch');
			menuItem.onClick((ev: MouseEvent) => {
				setExcludedFolders([...excludedFolders, folder.path]);
			});
		});

		// Trigger
		plugin.app.workspace.trigger('file-menu', fileMenu, folder, 'file-explorer');
		fileMenu.showAtPosition({ x: e.pageX, y: e.pageY });
		return false;
	};

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
									onContextMenu={(e: MouseEvent) => handleContextMenu(e, child.folder)}
									folder={child.folder}>
									<NestedFolders plugin={plugin} folderTree={child} />
								</Tree>
							) : (
								<Tree
									plugin={plugin}
									content={child.folder.name}
									onClick={() => handleFolderNameClick(child.folder.path)}
									onContextMenu={(e: MouseEvent) => handleContextMenu(e, child.folder)}
									folder={child.folder}
								/>
							)}
						</React.Fragment>
					);
				})}
		</React.Fragment>
	);
}
