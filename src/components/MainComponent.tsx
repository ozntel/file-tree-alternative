import { App } from 'obsidian';
import React, { useEffect, useState } from 'react';
import { FileComponent } from './FileComponent';
import { FolderComponent } from './FolderComponent';
import { FileTreeView } from '../FileTreeView';

interface MainTreeComponentProps {
    app: App,
    fileTreeView?: FileTreeView,
}

export function MainTreeComponent({ app, fileTreeView }: MainTreeComponentProps) {

    // View can be 'folder' or 'file'
    const [view, setView] = useState('folder');

    // Active Folder Path for Files List
    const [folderPath, setFolderPath] = useState('');

    return (
        <React.Fragment>
            {
                view === 'folder' ?
                    <FolderComponent
                        app={app}
                        setFolderPath={setFolderPath}
                        setView={setView}
                    />
                    :
                    <FileComponent
                        app={app}
                        folderPath={folderPath}
                        fileTreeView={fileTreeView}
                        setView={setView}
                    />
            }
        </React.Fragment>
    )

}