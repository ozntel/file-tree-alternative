import { TFolder } from 'obsidian'
import React from 'react'
import { animated, config, Spring } from 'react-spring'
import * as Icons from './icons'

type TreeProps = {
    open?: boolean,
    content?: string,
    onClick?: Function,
    onContextMenu?: Function,
    type?: any,
    style?: any,
    springConfig?: any,
    children?: any,
    setOpenFolders: Function,
    openFolders: TFolder[],
    folder: TFolder
}

type TreeState = {
    open: boolean,
}

export default class Tree extends React.Component<TreeProps, TreeState> {

    state = {
        open: this.props.open,
    }

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

    folderNameClickEvent = () => this.props.onClick()

    folderContextMenuEvent = () => this.props.onContextMenu();

    render() {

        const { open } = this.state
        const { children, content, type, style, springConfig } = this.props
        const Icon = children ? open ? Icons['MinusSquareO'] : Icons['PlusSquareO'] : Icons['CloseSquareO']

        return (
            <div style={{ ...styles.tree, ...style }} className="treeview">
                <Icon
                    className="toggle"
                    style={{ ...styles.toggle, opacity: children ? 1 : 0.3 }}
                    onClick={this.toggle}
                />
                <span style={{ ...styles.type, marginRight: type ? 10 : 0 }}>
                    {type}
                </span>
                <span
                    style={{ verticalAlign: 'middle' }}
                    onClick={this.folderNameClickEvent}
                    onContextMenu={this.folderContextMenuEvent}
                >
                    {content}
                </span>
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
                        height: open ? 'auto' : 0,
                        opacity: open ? 1 : 0,
                        transform: open ? 'translate3d(0px,0,0)' : 'translate3d(20px,0,0)',
                    }}
                    {...springConfig && springConfig(open)}
                    render={Contents}
                >
                    {this.props.children}
                </Spring>
            </div>
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
        borderLeft: '1px dashed rgba(255,255,255,0.4)',
        fontSize: 12.8
    } as React.CSSProperties,
}