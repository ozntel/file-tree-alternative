import React from 'react';
import { Menu, TFolder } from 'obsidian';
import Tree from 'components/FolderView/treeComponent/TreeComponent';
import { FolderTree } from 'utils/types';
import { VaultChangeModal } from 'modals';
import FileTreeAlternativePlugin from 'main';
import ConditionalRootFolderWrapper from 'components/FolderView/ConditionalWrapper';

interface FolderProps {
	plugin: FileTreeAlternativePlugin;
	folderTree: FolderTree;
	activeFolderPath: string;
	setActiveFolderPath: Function;
	setView: Function;
	openFolders: TFolder[];
	setOpenFolders: Function;
	excludedFolders: string[];
	setExcludedFolders: Function;
	folderFileCountMap: { [key: string]: number };
}

export class FolderComponent extends React.Component<FolderProps> {
	treeStyles = { color: '--var(--text-muted)', fill: '#c16ff7', width: '100%', left: 10, top: 10 };
	plugin = this.props.plugin;

	handleFolderNameClick = (folderPath: string) => {
		this.props.setActiveFolderPath(folderPath);
	};

	render() {
		return (
			<React.Fragment>
				<ConditionalRootFolderWrapper
					condition={this.plugin.settings.showRootFolder}
					wrapper={(children) => {
						return (
							<Tree
								plugin={this.plugin}
								content={this.plugin.app.vault.getName()}
								open
								style={this.treeStyles}
								onClick={() => this.handleFolderNameClick('/')}
								setOpenFolders={this.props.setOpenFolders}
								openFolders={this.props.openFolders}
								folder={this.plugin.app.vault.getRoot()}
								folderFileCountMap={this.props.folderFileCountMap}>
								{children}
							</Tree>
						);
					}}>
					{this.props.folderTree && (
						<NestedChildrenComponent
							plugin={this.plugin}
							folderTree={this.props.folderTree}
							activeFolderPath={this.props.activeFolderPath}
							setActiveFolderPath={this.props.setActiveFolderPath}
							setView={this.props.setView}
							openFolders={this.props.openFolders}
							setOpenFolders={this.props.setOpenFolders}
							excludedFolders={this.props.excludedFolders}
							setExcludedFolders={this.props.setExcludedFolders}
							folderFileCountMap={this.props.folderFileCountMap}
						/>
					)}
				</ConditionalRootFolderWrapper>
			</React.Fragment>
		);
	}
}

/* ------ Nested Children Component ------ */

interface NestedChildrenComponentProps {
	plugin: FileTreeAlternativePlugin;
	folderTree: FolderTree;
	activeFolderPath: string;
	setActiveFolderPath: Function;
	setView: Function;
	openFolders: TFolder[];
	setOpenFolders: Function;
	excludedFolders: string[];
	setExcludedFolders: Function;
	folderFileCountMap: { [key: string]: number };
}

class NestedChildrenComponent extends React.Component<NestedChildrenComponentProps> {
	plugin = this.props.plugin;

	handleFolderNameClick = (folderPath: string) => {
		this.props.setActiveFolderPath(folderPath);
	};

	handleContextMenu = (event: MouseEvent, folder: TFolder) => {
		// Event Undefined Correction
		let e = event;
		if (event === undefined) e = window.event as MouseEvent;

		// Menu Items
		const fileMenu = new Menu(this.plugin.app);

		fileMenu.addItem((menuItem) => {
			menuItem.setTitle('New Folder');
			menuItem.setIcon('folder');
			menuItem.onClick((ev: MouseEvent) => {
				let vaultChangeModal = new VaultChangeModal(this.plugin.app, folder, 'create folder');
				vaultChangeModal.open();
			});
		});

		fileMenu.addItem((menuItem) => {
			menuItem.setTitle('Delete');
			menuItem.setIcon('trash');
			menuItem.onClick((ev: MouseEvent) => {
				this.plugin.app.vault.delete(folder, true);
			});
		});

		fileMenu.addItem((menuItem) => {
			menuItem.setTitle('Rename');
			menuItem.setIcon('pencil');
			menuItem.onClick((ev: MouseEvent) => {
				let vaultChangeModal = new VaultChangeModal(this.plugin.app, folder, 'rename');
				vaultChangeModal.open();
			});
		});

		fileMenu.addItem((menuItem) => {
			menuItem.setTitle('Add to Excluded Folders');
			menuItem.setIcon('switch');
			menuItem.onClick((ev: MouseEvent) => {
				this.props.setExcludedFolders([...this.props.excludedFolders, folder.path]);
			});
		});

		// Trigger
		this.plugin.app.workspace.trigger('file-menu', fileMenu, folder, 'file-explorer');
		fileMenu.showAtPosition({ x: e.pageX, y: e.pageY });
		return false;
	};

	customSort = (folderTree: FolderTree[]) => {
		let newTree: FolderTree[];
		if (this.props.excludedFolders.length > 0) {
			newTree = folderTree.filter((tree) => !this.props.excludedFolders.contains(tree.folder.path));
		}
		newTree = newTree.sort((a, b) => a.folder.name.localeCompare(b.folder.name, 'en', { numeric: true }));
		return newTree;
	};

	render() {
		if (!this.props.folderTree.children) return null;

		return (
			<React.Fragment>
				{Array.isArray(this.props.folderTree.children) &&
					this.customSort(this.props.folderTree.children).map((child) => {
						return (
							<React.Fragment key={child.folder.path}>
								{(child.folder as TFolder).children.some((child) => child instanceof TFolder) ? (
									<Tree
										plugin={this.plugin}
										content={child.folder.name}
										open={this.props.openFolders.contains(child.folder) ? true : false}
										onClick={() => this.handleFolderNameClick(child.folder.path)}
										onContextMenu={(e: MouseEvent) => this.handleContextMenu(e, child.folder)}
										setOpenFolders={this.props.setOpenFolders}
										openFolders={this.props.openFolders}
										folder={child.folder}
										folderFileCountMap={this.props.folderFileCountMap}>
										<NestedChildrenComponent
											plugin={this.plugin}
											folderTree={child}
											activeFolderPath={this.props.activeFolderPath}
											setActiveFolderPath={this.props.setActiveFolderPath}
											setView={this.props.setView}
											openFolders={this.props.openFolders}
											setOpenFolders={this.props.setOpenFolders}
											excludedFolders={this.props.excludedFolders}
											setExcludedFolders={this.props.setExcludedFolders}
											folderFileCountMap={this.props.folderFileCountMap}
										/>
									</Tree>
								) : (
									<Tree
										plugin={this.plugin}
										content={child.folder.name}
										onClick={() => this.handleFolderNameClick(child.folder.path)}
										onContextMenu={(e: MouseEvent) => this.handleContextMenu(e, child.folder)}
										setOpenFolders={this.props.setOpenFolders}
										openFolders={this.props.openFolders}
										folder={child.folder}
										folderFileCountMap={this.props.folderFileCountMap}
									/>
								)}
							</React.Fragment>
						);
					})}
			</React.Fragment>
		);
	}
}
