import { TFolder, Menu, App } from 'obsidian';
import { VaultChangeModal, MoveSuggestionModal } from 'modals';
import * as Util from 'utils/Utils';

export function handleFolderContextMenu(event: MouseEvent, folder: TFolder, app: App, excludedFolders: string[], setExcludedFolders: Function) {
	// Event Undefined Correction
	let e = event;
	if (event === undefined) e = window.event as MouseEvent;

	// Menu Items
	const folderMenu = new Menu(app);

	folderMenu.addItem((menuItem) => {
		menuItem.setTitle('New Folder');
		menuItem.setIcon('folder');
		menuItem.onClick((ev: MouseEvent) => {
			let vaultChangeModal = new VaultChangeModal(app, folder, 'create folder');
			vaultChangeModal.open();
		});
	});

	folderMenu.addItem((menuItem) => {
		menuItem.setTitle('Delete');
		menuItem.setIcon('trash');
		menuItem.onClick((ev: MouseEvent) => {
			app.vault.delete(folder, true);
		});
	});

	folderMenu.addItem((menuItem) => {
		menuItem.setTitle('Rename');
		menuItem.setIcon('pencil');
		menuItem.onClick((ev: MouseEvent) => {
			let vaultChangeModal = new VaultChangeModal(app, folder, 'rename');
			vaultChangeModal.open();
		});
	});

	// Move Item
	if (!Util.internalPluginLoaded('file-explorer', app)) {
		folderMenu.addItem((menuItem) => {
			menuItem.setTitle('Move folder to...');
			menuItem.setIcon('paper-plane');
			menuItem.onClick((ev: MouseEvent) => {
				let folderMoveModal = new MoveSuggestionModal(app, folder);
				folderMoveModal.open();
			});
		});
	}

	folderMenu.addItem((menuItem) => {
		menuItem.setTitle('Add to Excluded Folders');
		menuItem.setIcon('switch');
		menuItem.onClick((ev: MouseEvent) => {
			setExcludedFolders([...excludedFolders, folder.path]);
		});
	});

	// Trigger
	app.workspace.trigger('file-menu', folderMenu, folder, 'file-explorer');
	folderMenu.showAtPosition({ x: e.pageX, y: e.pageY });
	return false;
}

export function handleRootFolderContextMenu(event: MouseEvent, app: App) {
	// Event Undefined Correction
	let e = event;
	if (event === undefined) e = window.event as MouseEvent;

	// Menu Items
	const fileMenu = new Menu(app);

	fileMenu.addItem((menuItem) => {
		menuItem.setTitle('New Folder');
		menuItem.setIcon('folder');
		menuItem.onClick((ev: MouseEvent) => {
			let vaultChangeModal = new VaultChangeModal(app, app.vault.getRoot(), 'create folder');
			vaultChangeModal.open();
		});
	});

	// Trigger
	app.workspace.trigger('root-folder-menu', fileMenu, app.vault.getRoot());
	fileMenu.showAtPosition({ x: e.pageX, y: e.pageY });
	return false;
}
