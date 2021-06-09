import { App } from 'obsidian';
import React, { useState } from 'react';
import { FileComponent } from './FileComponent';
import { FolderComponent } from './FolderComponent';
import { FileTreeView } from '../FileTreeView';

interface MainTreeComponentProps {
    app: App,
    fileTreeView?: FileTreeView,
}

export function MainTreeComponent({ app, fileTreeView }: MainTreeComponentProps) {

    // View can be 'folder' or 'file'
    const [view, SetView] = useState('folder');

    // Active Folder Path for Files List
    const [folderPath, setFolderPath] = useState('');

    return (
        <React.Fragment>
            {
                view === 'folder' ?
                    <FolderComponent
                        app={app}
                        setFolderPath={setFolderPath}
                    />
                    :
                    <FileComponent
                        app={app}
                        folderPath={folderPath}
                        fileTreeView={fileTreeView}
                    />
            }
        </React.Fragment>
    )

}