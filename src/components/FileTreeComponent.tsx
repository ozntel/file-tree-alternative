import React, { useState } from 'react';
// @ts-ignore
import { TFile, App, Keymap, Menu } from 'obsidian';

interface FileTreeProps {
    files: TFile[],
    app: App,
    folderPath: string
}

export function FileTreeComponent({ files, app, folderPath }: FileTreeProps) {

    const [activeFile, setActiveFile] = useState(null);

    const openFile = (file: TFile, e: React.MouseEvent) => {
        app.workspace.openLinkText(file.path, "/", Keymap.isModifier(e, "Mod") || 1 === e.button);
        setActiveFile(file);
    }

    const triggerContextMenu = (file: TFile, e: React.MouseEvent) => {
        const fileMenu = new Menu(app);
        app.workspace.trigger('file-menu', fileMenu, file, 'link-context-menu');
        fileMenu.showAtPosition({ x: e.pageX, y: e.pageY });
        return false;
    }

    const getFileNameAndExtension = (fullName: string) => {
        var index = fullName.lastIndexOf('.');
        return {
            fileName: fullName.substring(0, index),
            extension: fullName.substring(index + 1)
        }
    }

    const getFolderName = (folderPath: string) => {
        if (folderPath === '/') return app.vault.getName();
        let index = folderPath.lastIndexOf('/');
        if (index !== -1) return folderPath.substring(index + 1);
        return folderPath;
    }

    const sortedFiles = files.sort((a, b) => {
        var nameA = a.name.toUpperCase();
        var nameB = b.name.toUpperCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    })

    return (
        <React.Fragment>
            <div className="oz-file-tree-header">
                {getFolderName(folderPath)}
            </div>
            {sortedFiles.map(file => {
                return (
                    <div className="nav-file oz-nav-file" key={file.path} onClick={(e) => openFile(file, e)} onContextMenu={(e) => triggerContextMenu(file, e)}>
                        <div className={'nav-file-title oz-nav-file-title' + (activeFile === file ? ' is-active' : '')} data-path={file.path}>
                            {
                                getFileNameAndExtension(file.name).extension !== 'md' &&
                                <span className="nav-file-tag">
                                    {getFileNameAndExtension(file.name).extension}
                                </span>
                            }
                            <div className="nav-file-title-content">
                                {getFileNameAndExtension(file.name).fileName}
                            </div>
                        </div>
                    </div>
                )
            })}
        </React.Fragment>
    )
}