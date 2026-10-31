import React, { useState, useRef, useEffect } from 'react';
import FileTreeAlternativePlugin from 'main';
import { MainFolder } from 'components/FolderView/MainFolder';
import { FileComponent } from 'components/FileView/FileComponent';

export const SingleViewVertical = (props: { plugin: FileTreeAlternativePlugin }) => {
    let { plugin } = props;

    const [dividerOnMove, setDividerOnMove] = useState<boolean>(false);
    const [folderPaneHeight, setFolderPaneHeight] = useState<number>(null);
    const [clientY, setClientY] = useState<number>(null);

    let folderPaneRef = useRef<HTMLDivElement>();
    let dividerRef = useRef<HTMLDivElement>();

    let heightSetting = localStorage.getItem(plugin.keys.customHeightKey);

    useEffect(() => {
        if (folderPaneHeight) {
            localStorage.setItem(plugin.keys.customHeightKey, folderPaneHeight.toString());
        }
    }, [folderPaneHeight]);

    function touchMouseStart(e: React.PointerEvent<HTMLDivElement>) {
        if ((e.target as Element).id !== 'file-tree-divider') return;
        e.preventDefault();
        // Keep receiving move events while the finger/mouse leaves the thin divider
        (e.target as Element).setPointerCapture(e.pointerId);
        setDividerOnMove(true);
        let height = dividerRef.current.offsetTop - folderPaneRef.current.offsetTop;
        setFolderPaneHeight(height);
        setClientY(e.nativeEvent.clientY);
    }

    function touchMouseMove(e: React.PointerEvent<HTMLDivElement>) {
        if (!dividerOnMove) return;
        e.preventDefault();
        setFolderPaneHeight(folderPaneHeight + (e.nativeEvent.clientY - clientY));
        setClientY(e.nativeEvent.clientY);
    }

    function touchMouseEnd(e: React.PointerEvent<HTMLDivElement>) {
        if (!dividerOnMove) return;
        e.preventDefault();
        setDividerOnMove(false);
        setClientY(e.nativeEvent.clientY);
    }

    return (
        // Register Move & End Events for All File Tree Leaf
        <div className="file-tree-container" onPointerMove={(e) => touchMouseMove(e)} onPointerUp={(e) => touchMouseEnd(e)} onPointerCancel={(e) => touchMouseEnd(e)}>
            <div
                className="oz-folder-pane"
                ref={folderPaneRef}
                style={{ height: folderPaneHeight ? `${folderPaneHeight}px` : heightSetting && heightSetting !== '' ? `${heightSetting}px` : '50%' }}>
                <MainFolder plugin={plugin} />
            </div>

            {/* Pointer Down Event only For Divider (mouse and touch) */}
            <div
                id="file-tree-divider"
                ref={dividerRef}
                onClick={(e) => e.preventDefault()}
                onPointerDown={(e) => touchMouseStart(e)}
                className={dividerOnMove ? 'active-divider' : ''}></div>

            <div className="oz-file-list-pane">
                <FileComponent plugin={plugin} />
            </div>
        </div>
    );
};

export const SingleViewHorizontal = (props: { plugin: FileTreeAlternativePlugin }) => {
    let { plugin } = props;

    const [dividerOnMove, setDividerOnMove] = useState<boolean>(false);
    const [folderPaneWidth, setFolderPaneWidth] = useState<number>(null);
    const [clientX, setClientX] = useState<number>(null);

    let folderPaneRef = useRef<HTMLDivElement>();
    let dividerRef = useRef<HTMLDivElement>();

    let widthSetting = localStorage.getItem(plugin.keys.customWidthKey);

    useEffect(() => {
        if (folderPaneWidth) {
            localStorage.setItem(plugin.keys.customWidthKey, folderPaneWidth.toString());
        }
    }, [folderPaneWidth]);

    function touchMouseStart(e: React.PointerEvent<HTMLDivElement>) {
        if ((e.target as Element).id !== 'file-tree-divider-horizontal') return;
        e.preventDefault();
        // Keep receiving move events while the finger/mouse leaves the thin divider
        (e.target as Element).setPointerCapture(e.pointerId);
        setDividerOnMove(true);
        let width = dividerRef.current.offsetLeft - folderPaneRef.current.offsetLeft;
        setFolderPaneWidth(width);
        setClientX(e.nativeEvent.clientX);
    }

    function touchMouseMove(e: React.PointerEvent<HTMLDivElement>) {
        if (!dividerOnMove) return;
        e.preventDefault();
        setFolderPaneWidth(folderPaneWidth + (e.nativeEvent.clientX - clientX));
        setClientX(e.nativeEvent.clientX);
    }

    function touchMouseEnd(e: React.PointerEvent<HTMLDivElement>) {
        if (!dividerOnMove) return;
        e.preventDefault();
        setDividerOnMove(false);
        setClientX(e.nativeEvent.clientX);
    }

    return (
        // Register Move & End Events for All File Tree Leaf
        <div className="file-tree-container-horizontal" onPointerMove={(e) => touchMouseMove(e)} onPointerUp={(e) => touchMouseEnd(e)} onPointerCancel={(e) => touchMouseEnd(e)}>
            <div
                className="oz-folder-pane-horizontal"
                ref={folderPaneRef}
                style={{ width: folderPaneWidth ? `${folderPaneWidth}px` : widthSetting && widthSetting !== '' ? `${widthSetting}px` : '50%' }}>
                <MainFolder plugin={plugin} />
            </div>

            {/* Pointer Down Event only For Divider (mouse and touch) */}
            <div
                id="file-tree-divider-horizontal"
                ref={dividerRef}
                onClick={(e) => e.preventDefault()}
                onPointerDown={(e) => touchMouseStart(e)}
                className={dividerOnMove ? 'active-divider' : ''}></div>

            <div className="oz-file-list-pane-horizontal">
                <FileComponent plugin={plugin} />
            </div>
        </div>
    );
};
