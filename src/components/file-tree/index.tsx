import React, { useEffect, useState } from 'react'
import { render } from 'react-dom'
import { animated, config, Spring } from 'react-spring'
import * as Icons from './icons'

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
    } as React.CSSProperties,
}

type TreeProps = {
    open?: boolean,
    visible?: boolean,
    canHide?: boolean,
    content?: string,
    onClick?: Function,
    type?: any,
    style?: any,
    springConfig?: any,
    children?: any,
}

type TreeState = {
    open: boolean,
    visible: boolean,
    immediate: boolean
}

// @ts-ignore
const Contents = ({ children, ...style }) => (
    <animated.div style={{ ...style, ...styles.contents }}>
        {children}
    </animated.div>
)

export default class Tree extends React.Component<TreeProps, TreeState> {

    static defaultProps = { open: false, visible: true, canHide: false }

    state = {
        open: this.props.open,
        visible: this.props.visible,
        immediate: false
    }

    toggle = () =>
        this.props.children &&
        this.setState(state => ({ open: !this.state.open, immediate: false }))

    toggleVisibility = () => {
        this.setState(
            state => ({ visible: !state.visible, immediate: true }),
        )
    }

    folderNameClickEvent = () => {
        this.props.onClick && this.props.onClick(this.state.visible)
    }

    componentWillReceiveProps(props: TreeProps) {
        this.setState(state => {
            return ['open', 'visible'].reduce(
                (acc, val) =>
                    // @ts-ignore
                    this.props[val] !== props[val] ? { ...acc, [val]: props[val] } : acc,
                {}
            )
        })
    }

    render() {

        const { open, visible, immediate } = this.state
        const { children, content, type, style, canHide, springConfig } = this.props
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
                {canHide && (
                    <Icons.EyeO
                        className="toggle"
                        style={{ ...styles.toggle, opacity: visible ? 1 : 0.4 }}
                        onClick={this.toggleVisibility}
                    />
                )}
                <span style={{ verticalAlign: 'middle' }} onClick={this.folderNameClickEvent}>{content}</span>
                <Spring
                    native
                    immediate={immediate}
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