import { App } from 'obsidian';
import React, { useEffect, useState } from 'react';
import { FileComponent } from './FileComponent';
import { FolderComponent } from './FolderComponent';
import { FileTreeView } from '../FileTreeView';
import FileTreeAlternativePlugin from '../main';

interface MainTreeComponentProps {
    app: App,
    fileTreeView?: FileTreeView,
    plugin: FileTreeAlternativePlugin
}

export function MainTreeComponent({ app, fileTreeView, plugin }: MainTreeComponentProps) {

    // View can be 'folder' or 'file'
    const [view, setView] = useState('folder');

    // Active Folder Path for Files List
    const [activeFolderPath, setActiveFolderPath] = useState('');

    return (
        <React.Fragment>
            {
                view === 'folder' ?
                    <FolderComponent
                        app={app}
                        activeFolderPath={activeFolderPath}
                        setActiveFolderPath={setActiveFolderPath}
                        setView={setView}
                    />
                    :
                    <FileComponent
                        app={app}
                        activeFolderPath={activeFolderPath}
                        fileTreeView={fileTreeView}
                        setView={setView}
                    />
            }
        </React.Fragment>
    )

}