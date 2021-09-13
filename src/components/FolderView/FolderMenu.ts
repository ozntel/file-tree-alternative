import { TFolder, Menu, App } from 'obsidian';
import { VaultChangeModal } from 'modals';

export function handleFolderContextMenu(event: MouseEvent, folder: TFolder, app: App, excludedFolders: string[], setExcludedFolders: Function) {
	// Event Undefined Correction
	let e = event;
	if (event === undefined) e = window.event as MouseEvent;

	// Menu Items
	const fileMenu = new Menu(app);

	fileMenu.addItem((menuItem) => {
		menuItem.setTitle('New Folder');
		menuItem.setIcon('folder');
		menuItem.onClick((ev: MouseEvent) => {
			let vaultChangeModal = new VaultChangeModal(app, folder, 'create folder');
			vaultChangeModal.open();
		});
	});

	fileMenu.addItem((menuItem) => {
		menuItem.setTitle('Delete');
		menuItem.setIcon('trash');
		menuItem.onClick((ev: MouseEvent) => {
			app.vault.delete(folder, true);
		});
	});

	fileMenu.addItem((menuItem) => {
		menuItem.setTitle('Rename');
		menuItem.setIcon('pencil');
		menuItem.onClick((ev: MouseEvent) => {
			let vaultChangeModal = new VaultChangeModal(app, folder, 'rename');
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
	app.workspace.trigger('file-menu', fileMenu, folder, 'file-explorer');
	fileMenu.showAtPosition({ x: e.pageX, y: e.pageY });
	return false;
}
