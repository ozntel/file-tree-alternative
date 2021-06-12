import { Modal, App, TFolder, TFile, TAbstractFile } from 'obsidian';

export class VaultChangeModal extends Modal {

    file: TFolder | TFile | TAbstractFile;
    action: string;

    constructor(app: App, file: TFolder | TFile | TAbstractFile, action: string) {
        super(app);
        this.file = file;
        this.action = action;
    }

    onOpen() {
        let { contentEl } = this;
        let myModal = this;

        // Header
        let headerText: string;

        if (this.action === 'rename') {
            headerText = 'Rename: Provide a New Name'
        } else if (this.action === 'create folder') {
            headerText = 'Create Folder: Provide Name'
        } else if (this.action === 'create note') {
            headerText = 'Create Note: Provide Name'
        }

        const headerEl = contentEl.createEl('h4', { text: headerText })
        headerEl.style.cssText = 'text-align: center; font-weight: normal'

        // Input El
        const inputEl = contentEl.createEl('input')

        inputEl.style.cssText = 'width: 100%; height: 2.5em; margin-bottom: 15px;'
        if (this.action === 'rename') {
            // Manual Rename Handler For md Files
            if (this.file.name.endsWith('.md')) {
                inputEl.value = this.file.name.substring(0, this.file.name.lastIndexOf('.'));
            } else {
                inputEl.value = this.file.name;
            }
        }

        // Buttons
        let changeButtonText: string;

        if (this.action === 'rename') {
            changeButtonText = 'Change Name'
        } else if (this.action === 'create folder') {
            changeButtonText = 'Create Folder'
        } else if (this.action === 'create note') {
            changeButtonText = 'Create Note'
        }

        const changeButton = contentEl.createEl('button', { text: changeButtonText });

        const cancelButton = contentEl.createEl('button', { text: 'Cancel' });
        cancelButton.style.cssText = 'float: right;';
        cancelButton.addEventListener('click', () => {
            myModal.close();
        })

        // Event Listener
        changeButton.addEventListener('click', async () => {
            let newName = inputEl.value;
            if (this.action === 'rename') {
                // Manual Rename Handler For md Files
                if (this.file.name.endsWith('.md')) newName = newName + '.md';
                this.app.fileManager.renameFile(this.file, this.file.parent.path + '/' + newName);
            } else if (this.action === 'create folder') {
                this.app.vault.createFolder(this.file.path + '/' + newName);
            } else if (this.action === 'create note') {
                // @ts-ignore
                const newFile = await this.app.fileManager.createNewMarkdownFile(this.file, newName);
                const newLeaf = this.app.workspace.activeLeaf;
                await newLeaf.openFile(newFile);
                this.app.workspace.setActiveLeaf(newLeaf, false, true);
            }
            myModal.close()
        })

    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}