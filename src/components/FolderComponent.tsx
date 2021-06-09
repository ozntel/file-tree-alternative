import React, { useState } from 'react';
import { App, TFolder } from 'obsidian';
import Tree from './file-tree/index';

interface FolderProps {
    app: App,
    setFolderPath: Function,
}

export function FolderComponent({ app }: FolderProps) {

    const rootFolder: TFolder = app.vault.getRoot()

    const treeStyles = {
        color: 'white',
        fill: 'white',
        width: '100%'
    }

    return (
        <React.Fragment>
            <Tree content={app.vault.getName()} open style={treeStyles}>
                <NestedChildrenComponent folder={rootFolder} />
            </Tree>
        </React.Fragment>
    )
}

/* ------ Nested Children Component ------ */

interface NestedChildrenComponentProps {
    folder: TFolder
}

function NestedChildrenComponent(props: NestedChildrenComponentProps) {
    if (!props.folder.children) {
        return null
    }

    return (
        <React.Fragment>
            {
                Array.isArray(props.folder.children) &&
                props.folder.children.filter(child => child instanceof TFolder)
                    .map(child => {
                        return (
                            <React.Fragment key={child.path}>
                                {
                                    (child as TFolder).children.some(child => child instanceof TFolder) ?
                                        <Tree content={child.name} onClick={() => { console.log("Hello") }}>
                                            <NestedChildrenComponent folder={(child as TFolder)} />
                                        </Tree>
                                        :
                                        <Tree content={child.name} />
                                }

                            </React.Fragment>
                        )
                    })
            }
        </React.Fragment>
    )
}