import React from 'react';
import { Menu, TFolder } from 'obsidian';
import Tree from 'components/FolderView/treeComponent/TreeComponent';
import { FolderTree } from 'utils/types';
import { VaultChangeModal } from 'modals';
import FileTreeAlternativePlugin from 'main';
import ConditionalRootFolderWrapper from 'components/FolderView/ConditionalWrapper';
import { useRecoilState } from 'recoil';
import { activeFolderPathState, excludedFoldersState, openFoldersState } from 'recoil/pluginState';

interface FolderProps {
	plugin: FileTreeAlternativePlugin;
	folderTree: FolderTree;
	openFolders: TFolder[];
	setOpenFolders: Function;
}

export function FolderComponent(props: FolderProps) {
	const treeStyles = { color: '--var(--text-muted)', fill: '#c16ff7', width: '100%', left: 10, top: 10 };
	const plugin = props.plugin;

	const [activeFolderPath, setActiveFolderPath] = useRecoilState(activeFolderPathState);

	const handleFolderNameClick = (folderPath: string) => {
		setActiveFolderPath(folderPath);
	};

	return (
		<React.Fragment>
			<ConditionalRootFolderWrapper
				condition={plugin.settings.showRootFolder}
				wrapper={(children) => {
					return (
						<Tree
							plugin={plugin}
							content={plugin.app.vault.getName()}
							open
							style={treeStyles}
							onClick={() => handleFolderNameClick('/')}
							folder={plugin.app.vault.getRoot()}>
							{children}
						</Tree>
					);
				}}>
				{props.folderTree && <NestedChildrenComponent plugin={plugin} folderTree={props.folderTree} />}
			</ConditionalRootFolderWrapper>
		</React.Fragment>
	);
}

/* ------ Nested Children Component ------ */

interface NestedChildrenComponentProps {
	plugin: FileTreeAlternativePlugin;
	folderTree: FolderTree;
}

function NestedChildrenComponent(props: NestedChildrenComponentProps) {
	const plugin = props.plugin;

	// Global States
	const [openFolders] = useRecoilState(openFoldersState);
	const [activeFolderPath, setActiveFolderPath] = useRecoilState(activeFolderPathState);
	const [excludedFolders, setExcludedFolders] = useRecoilState(excludedFoldersState);

	const handleFolderNameClick = (folderPath: string) => {
		setActiveFolderPath(folderPath);
	};

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

	const customSort = (folderTree: FolderTree[]) => {
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
				customSort(props.folderTree.children).map((child) => {
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
									<NestedChildrenComponent plugin={plugin} folderTree={child} />
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
