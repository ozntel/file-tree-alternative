import { Modal, App, TFolder, TAbstractFile, FuzzySuggestModal, normalizePath, Notice } from 'obsidian';
import FileTreeAlternativePlugin from 'main';
import { getFileCreateString, createNewMarkdownFile } from 'utils/newFile';
import { OZFile } from 'utils/types';

type Action = 'rename' | 'create folder' | 'create note';

export class ConfirmationModal extends Modal {
    // Constructor Variables
    confirmationNote: string;
    callBackAfterConfirmation: Function;
    plugin: FileTreeAlternativePlugin;

    // Local Global Variables
    confirmButton: HTMLButtonElement;
    onConfirmClickAction: (e: MouseEvent) => void;

    constructor(plugin: FileTreeAlternativePlugin, confirmationNote: string, callBackAfterConfirmation: Function) {
        super(plugin.app);
        this.confirmationNote = confirmationNote;
        this.callBackAfterConfirmation = callBackAfterConfirmation;
        this.plugin = plugin;
    }

    onOpen(): void {
        let { contentEl } = this;
        let confirmationModal = this;

        const headerEl = contentEl.createEl('div', { text: this.confirmationNote });
        headerEl.addClass('modal-title');

        this.confirmButton = contentEl.createEl('button', { text: 'Confirm' });
        const cancelButton = contentEl.createEl('button', { text: 'Cancel' });

        cancelButton.style.cssText = 'float: right;';
        cancelButton.addEventListener('click', () => {
            confirmationModal.close();
        });

        // Create Button Action and Assign to the Global Variable of the class
        this.onConfirmClickAction = (e: MouseEvent) => {
            this.callBackAfterConfirmation();
            this.close();
        };

        // Assign the event listener
        this.confirmButton.addEventListener('click', this.onConfirmClickAction);
    }

    onClose(): void {
        let { contentEl } = this;
        contentEl.empty();
        this.confirmButton.removeEventListener('click', this.onConfirmClickAction);
    }
}

export class VaultChangeModal extends Modal {
    file: TFolder | OZFile | TAbstractFile;
    action: Action;
    plugin: FileTreeAlternativePlugin;

    constructor(plugin: FileTreeAlternativePlugin, file: TFolder | OZFile | TAbstractFile, action: Action) {
        super(plugin.app);
        this.file = file;
        this.action = action;
        this.plugin = plugin;
    }

    onOpen() {
        let { contentEl } = this;
        let myModal = this;

        // Header
        let headerText: string;

        if (this.action === 'rename') {
            headerText = 'Rename: Provide a New Name';
        } else if (this.action === 'create folder') {
            headerText = 'Create Folder: Provide Name';
        } else if (this.action === 'create note') {
            headerText = 'Create Note: Provide Name';
        }

        const headerEl = contentEl.createEl('div', { text: headerText });
        headerEl.addClass('modal-title');

        // Input El
        const inputEl = contentEl.createEl('input');

        inputEl.style.cssText = 'width: 100%; height: 2.5em; margin-bottom: 15px;';
        if (this.action === 'rename') {
            // Manual Rename Handler For md Files
            if (this.file.path.endsWith('.md')) {
                if (this.file instanceof TFolder || this.file instanceof TAbstractFile) {
                    inputEl.value = this.file.name.substring(0, this.file.name.lastIndexOf('.'));
                } else {
                    inputEl.value = this.file.basename;
                }
            } else {
                if (this.file instanceof TFolder || this.file instanceof TAbstractFile) {
                    inputEl.value = this.file.name;
                } else {
                    inputEl.value = this.file.basename;
                }
            }
        } else if (this.action === 'create note' || this.action === 'create folder') {
            inputEl.value = 'Untitled';
            inputEl.select();
        }

        inputEl.focus();

        // Buttons
        let changeButtonText: string;

        if (this.action === 'rename') {
            changeButtonText = 'Change Name';
        } else if (this.action === 'create folder') {
            changeButtonText = 'Create Folder';
        } else if (this.action === 'create note') {
            changeButtonText = 'Create Note';
        }

        const changeButton = contentEl.createEl('button', { text: changeButtonText });

        const cancelButton = contentEl.createEl('button', { text: 'Cancel' });
        cancelButton.style.cssText = 'float: right;';
        cancelButton.addEventListener('click', () => {
            myModal.close();
        });

        const onClickAction = async () => {
            let newName = inputEl.value;
            if (this.action === 'rename') {
                // Manual Rename Handler For md Files
                if (this.file.path.endsWith('.md')) {
                    newName = newName + '.' + this.file.path.slice(this.file.path.lastIndexOf('.') + 1);
                }
                // Folder Note files to be updated
                if (this.file instanceof TFolder && this.plugin.settings.folderNote) {
                    let folderNoteFile = this.app.vault.getAbstractFileByPath(normalizePath(this.file.path + '/' + this.file.name + '.md'));
                    if (folderNoteFile) {
                        const newFolderNotePath = normalizePath(this.file.path + '/' + newName + '.md');
                        await this.app.fileManager.renameFile(folderNoteFile, newFolderNotePath);
                    }
                }
                // Rename the destination file/folder name
                const targetFile =
                    this.file instanceof TFolder || this.file instanceof TAbstractFile
                        ? this.file
                        : this.plugin.app.vault.getAbstractFileByPath(this.file.path);
                if (targetFile) {
                    const parentFolder = targetFile.parent;
                    const parentPath = parentFolder && !parentFolder.isRoot() ? `${parentFolder.path}/` : '';
                    const newPath = normalizePath(`${parentPath}${newName}`);
                    await this.app.fileManager.renameFile(targetFile, newPath);
                }
            } else if (this.action === 'create folder') {
                const targetFolder = this.file.path === '/' || this.file.path === '' ? '' : `${this.file.path}/`;
                const newFolderPath = normalizePath(`${targetFolder}${newName}`);
                if (this.app.vault.getAbstractFileByPath(newFolderPath)) {
                    new Notice(`Folder "${newName}" already exists`);
                    return;
                }
                await this.app.vault.createFolder(newFolderPath);
            } else if (this.action === 'create note') {
                await createNewMarkdownFile(
                    this.plugin,
                    this.file as TFolder,
                    newName,
                    this.plugin.settings.createdYaml ? getFileCreateString({ plugin: this.plugin, fileName: newName }) : ''
                );
            }
            myModal.close();
        };

        // Event Listener
        changeButton.addEventListener('click', onClickAction);
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') onClickAction();
        });
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}

export class MoveSuggestionModal extends FuzzySuggestModal<TFolder> {
    app: App;
    fileOrFolderToMove: OZFile | TFolder;

    constructor(app: App, fileOrFolderToMove: OZFile | TFolder) {
        super(app);
        this.fileOrFolderToMove = fileOrFolderToMove;
    }

    getItemText(item: TFolder): string {
        return item.path === '/' ? '/' : item.path;
    }

    getItems(): TFolder[] {
        return getAllFoldersInVault(this.app);
    }

    async onChooseItem(item: TFolder, evt: MouseEvent | KeyboardEvent) {
        let fileToMove: TAbstractFile;
        if (this.fileOrFolderToMove instanceof TFolder) {
            fileToMove = this.fileOrFolderToMove;
        } else {
            fileToMove = this.app.vault.getAbstractFileByPath(this.fileOrFolderToMove.path);
        }

        if (!fileToMove) {
            new Notice('Could not find file or folder to move');
            return;
        }

        // Check if moving folder under itself or child
        if (fileToMove instanceof TFolder) {
            const isSelfOrChild = item.path === fileToMove.path || item.path.startsWith(fileToMove.path + '/');
            if (isSelfOrChild) {
                new Notice("You can't move a folder under itself or its child");
                return;
            }
        }

        const newPath = normalizePath(item.isRoot() ? fileToMove.name : `${item.path}/${fileToMove.name}`);
        if (fileToMove.path === newPath) {
            return;
        }

        if (this.app.vault.getAbstractFileByPath(newPath)) {
            new Notice(`A file or folder with the name "${fileToMove.name}" already exists in the destination folder`);
            return;
        }

        try {
            await this.app.fileManager.renameFile(fileToMove, newPath);
        } catch (err) {
            console.error('Failed to move', err);
            new Notice(`Failed to move: ${err.message || err}`);
        }
    }
}

function getAllFoldersInVault(app: App): TFolder[] {
    let folders: TFolder[] = [];
    let rootFolder = app.vault.getRoot();
    folders.push(rootFolder);
    function recursiveFx(folder: TFolder) {
        for (let child of folder.children) {
            if (child instanceof TFolder) {
                let childFolder: TFolder = child as TFolder;
                folders.push(childFolder);
                if (childFolder.children) recursiveFx(childFolder);
            }
        }
    }
    recursiveFx(rootFolder);
    return folders;
}
