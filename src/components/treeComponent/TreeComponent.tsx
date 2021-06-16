import { TFolder } from 'obsidian'
import React from 'react'
import { animated, config, Spring } from 'react-spring'
import FileTreeAlternativePlugin from 'src/main'
import Dropzone from 'react-dropzone';
import * as Icons from './icons'

type TreeProps = {
    open?: boolean,
    content?: string,
    onClick?: Function,
    onContextMenu?: Function,
    type?: any,
    style?: any,
    children?: any,
    setOpenFolders: Function,
    openFolders: TFolder[],
    folder: TFolder,
    folderFileCountMap: { [key: string]: number },
    plugin: FileTreeAlternativePlugin,
}

type TreeState = {
    open: boolean,
    highlight: boolean,
}

export default class Tree extends React.Component<TreeProps, TreeState> {

    state = {
        open: this.props.open,
        highlight: false,
    }

    // Icon to be toggled between min(-) and plus(+) - Each click sets openFolders Main Component state to save in settings
    toggle = () => {
        if (this.props.children) {
            // Set State in Main Component for Keeping Folders Open
            if (!this.state.open) {
                this.props.setOpenFolders([...this.props.openFolders, this.props.folder]);
            } else {
                const newOpenFolders = this.props.openFolders.filter(folder => {
                    if (this.props.folder === folder) return false;
                    return true;
                })
                this.props.setOpenFolders(newOpenFolders);
            }
            // Set State Open for the Folder
            this.setState(state => ({ open: !this.state.open }));
        }
    }

    // Function After an External File Dropped into Folder Name
    onDrop = (files: File[]) => {
        files.map(async (file) => {
            file.arrayBuffer().then(arrayBuffer => {
                this.props.plugin.app.vault.adapter.writeBinary(this.props.folder.path + '/' + file.name, arrayBuffer);
            })
        })
    }

    // Click Events
    folderNameClickEvent = () => this.props.onClick()
    folderContextMenuEvent = () => this.props.onContextMenu();

    render() {
        const Icon = this.props.children ? this.state.open ? Icons['MinusSquareO'] : Icons['PlusSquareO'] : Icons['CloseSquareO']
        return (
            <Dropzone
                onDrop={this.onDrop}
                noClick={true}
                onDragEnter={() => this.setState({ highlight: true })}
                onDragLeave={() => this.setState({ highlight: false })}
            >

                {({ getRootProps, getInputProps }) => (

                    <div style={{ ...styles.tree, ...this.props.style }} className="treeview">

                        <div {...getRootProps({ className: 'dropzone' })}
                            className={"oz-folder-element" + (this.state.highlight ? " drag-entered" : '')}
                            data-path={this.props.folder.path}
                        >

                            <input {...getInputProps()} />

                            <div style={{ width: '100%' }}>

                                <div style={{ display: 'inline-block' }}>
                                    <Icon className="toggle" style={{ ...styles.toggle, opacity: this.props.children ? 1 : 0.3 }} onClick={this.toggle} />
                                </div>

                                <div style={{ display: 'inline-block', width: '100%' }} onClick={this.folderNameClickEvent} onContextMenu={this.folderContextMenuEvent}>
                                    <div style={{ ...styles.type, marginRight: this.props.type ? 10 : 0 }}> {this.props.type} </div>
                                    <div style={{ verticalAlign: 'middle', display: 'inline-block' }}>
                                        {this.props.content}
                                    </div>
                                    {
                                        (!this.state.open && this.props.folderFileCountMap[this.props.folder.path]) &&
                                        <div style={{ float: 'right', paddingRight: '34px', display: 'inline-block' }} className="oz-folder-count">
                                            <span className="nav-file-tag">
                                                {this.props.folderFileCountMap[this.props.folder.path]}
                                            </span>
                                        </div>
                                    }
                                </div>

                            </div>

                        </div>

                        <Spring
                            native
                            immediate={true}
                            config={{
                                ...config.default,
                                restSpeedThreshold: 1,
                                restDisplacementThreshold: 0.01,
                            }}
                            from={{ height: 0, opacity: 0, transform: 'translate3d(20px,0,0)' }}
                            to={{
                                height: this.state.open ? 'auto' : 0,
                                opacity: this.state.open ? 1 : 0,
                                transform: this.state.open ? 'translate3d(0px,0,0)' : 'translate3d(20px,0,0)',
                            }}
                            render={Contents}
                        >
                            {this.props.children}
                        </Spring>

                    </div>
                )}
            </Dropzone>
        )
    }
}

// @ts-ignore
const Contents = ({ children, ...style }) => (
    <animated.div style={{ ...style, ...styles.contents }}>
        {children}
    </animated.div>
)

const styles = {
    tree: {
        position: 'relative',
        padding: '4px 0px 0px 0px',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        verticalAlign: 'middle',
    } as React.CSSProperties,
    toggle: {
        width: '1em',
        height: '1em',
        marginRight: 10,
        cursor: 'pointer',
        verticalAlign: 'middle',
    } as React.CSSProperties,
    type: {
        textTransform: 'uppercase',
        fontFamily: 'monospace',
        fontSize: '0.6em',
        verticalAlign: 'middle',
    } as React.CSSProperties,
    contents: {
        willChange: 'transform, opacity, height',
        marginLeft: 6,
        padding: '4px 0px 0px 14px',
        borderLeft: '1px dashed',
        borderLeftColor: 'var(--text-muted)',
        fontSize: 12.8
    } as React.CSSProperties,
}