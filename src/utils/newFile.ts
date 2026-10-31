import FileTreeAlternativePlugin from 'main';
import { stripIndents } from 'common-tags';
import dayjs from 'dayjs';
import { TFile, TFolder, App, Platform } from 'obsidian';
import { eventTypes, OZFile } from 'utils/types';

export const openFile = (props: { file: OZFile; app: App; newLeaf: boolean; leafBySplit?: boolean }) => {
    const { file, app, newLeaf, leafBySplit } = props;
    let fileToOpen = app.vault.getAbstractFileByPath(file.path);
    if (!fileToOpen) return;
    let leaf = app.workspace.getLeaf(newLeaf);
    if (leafBySplit) leaf = app.workspace.createLeafBySplit(leaf, 'vertical');
    app.workspace.setActiveLeaf(leaf, {
        focus: true,
    });
    leaf.openFile(fileToOpen as TFile, { eState: { focus: true } });
    closeSidebarOnPhone(app);
};

// On phones the sidebar is a drawer covering the note, close it like the core file explorer does
export const closeSidebarOnPhone = (app: App) => {
    if (!Platform.isPhone) return;
    const { leftSplit, rightSplit } = app.workspace;
    for (const treeLeaf of app.workspace.getLeavesOfType('file-tree-view')) {
        const root = treeLeaf.getRoot();
        if (root === leftSplit) leftSplit.collapse();
        else if (root === rightSplit) rightSplit.collapse();
    }
};

export const getFileCreateString = (params: { plugin: FileTreeAlternativePlugin; fileName: string }): string => {
    const { plugin, fileName } = params;

    return stripIndents`
    ${
        plugin.settings.createdYaml
            ? `
        ---
        created: ${dayjs(new Date()).format('YYYY-MM-DD hh:mm:ss')}
        ---
        `
            : ''
    }
    ${plugin.settings.fileNameIsHeader ? `# ${fileName}` : ''}
    `;
};

export const createNewMarkdownFile = async (plugin: FileTreeAlternativePlugin, folder: TFolder, newFileName: string, content?: string) => {
    // @ts-ignore
    const newFile = await plugin.app.fileManager.createNewMarkdownFile(folder, newFileName);
    if (content && content !== '') await plugin.app.vault.modify(newFile, content);
    openFile({ file: newFile, app: plugin.app, newLeaf: false });
    let evt = new CustomEvent(eventTypes.activeFileChange, { detail: { filePath: newFile.path } });
    window.dispatchEvent(evt);
};

export const openFileInNewTab = (app: App, file: OZFile) => {
    openFile({ file: file, app: app, newLeaf: true });
};

export const openFileInNewTabGroup = (app: App, file: OZFile) => {
    openFile({ file: file, app: app, newLeaf: false, leafBySplit: true });
};
