import React, { useState, useEffect, useMemo } from 'react';
import Dropzone from 'react-dropzone';
import * as Icons from 'utils/icons';
import FileTreeAlternativePlugin from 'main';
import { OZFile } from 'utils/types';
import * as Util from 'utils/Utils';
import * as recoilState from 'recoil/pluginState';
import { useRecoilState } from 'recoil';
import useForceUpdate from 'hooks/ForceUpdate';
import useLongPress from 'hooks/useLongPress';
import * as FileViewHandlers from 'components/FileView/handlers';
import LazyLoad from 'react-lazy-load';

interface FilesProps {
    plugin: FileTreeAlternativePlugin;
}

export function FileComponent(props: FilesProps) {
    let searchInput = React.useRef<HTMLInputElement>(null);
    const plugin = props.plugin;

    // States Coming From Main Component
    const [_view, setView] = useRecoilState(recoilState.view);
    const [ozFileList, setOzFileList] = useRecoilState(recoilState.ozFileList);
    const [ozPinnedFiles] = useRecoilState(recoilState.ozPinnedFileList);
    const [activeFolderPath, setActiveFolderPath] = useRecoilState(recoilState.activeFolderPath);
    const [excludedExtensions] = useRecoilState(recoilState.excludedExtensions);
    const [excludedFolders] = useRecoilState(recoilState.excludedFolders);
    const [showSubFolders, setShowSubFolders] = useRecoilState(recoilState.showSubFolders);
    const [focusedFolder, _setFocusedFolder] = useRecoilState(recoilState.focusedFolder);

    // Local States
    const [highlight, setHighlight] = useState<boolean>(false);
    const [searchPhrase, setSearchPhrase] = useState<string>('');
    const [searchBoxVisible, setSearchBoxVisible] = useState<boolean>(false);
    const [treeHeader, setTreeHeader] = useState<string>(Util.getFolderName(activeFolderPath, plugin.app));

    // Force Update
    const forceUpdate = useForceUpdate();

    // Folder Name Update once Active Folder Path Change
    useEffect(() => setTreeHeader(Util.getFolderName(activeFolderPath, plugin.app)), [activeFolderPath]);

    // File List Update once showSubFolders change
    useEffect(() => {
        setOzFileList(
            Util.getFilesUnderPath({
                path: activeFolderPath,
                plugin: plugin,
                excludedExtensions: excludedExtensions,
                excludedFolders: excludedFolders,
            })
        );
    }, [showSubFolders, excludedExtensions, excludedFolders]);

    // To focus on Search box if visible set
    useEffect(() => {
        if (searchBoxVisible) searchInput.current.focus();
    }, [searchBoxVisible]);

    const filesToList: OZFile[] = useMemo(
        () =>
            FileViewHandlers.sortedFiles({
                fileList: ozFileList,
                plugin: plugin,
                ozPinnedFiles: ozPinnedFiles,
            }),
        [excludedFolders, excludedExtensions, ozPinnedFiles, ozFileList, plugin.settings.sortFilesBy, plugin.settings.sortReverse]
    );

    // Go Back Button - Sets Main Component View to Folder
    const handleGoBack = (e: React.MouseEvent) => {
        setView('folder');
        setActiveFolderPath('');
    };

    // Toggle Search Box Visibility State
    const toggleSearchBox = () => {
        setSearchPhrase('');
        setSearchBoxVisible(!searchBoxVisible);
        setOzFileList(
            Util.getFilesUnderPath({
                path: activeFolderPath,
                plugin: plugin,
                excludedExtensions: excludedExtensions,
                excludedFolders: excludedFolders,
            })
        );
    };

    const toggleShowSubFolders = async () => {
        plugin.settings.showFilesFromSubFolders = !showSubFolders;
        await plugin.saveSettings();
        setShowSubFolders(!showSubFolders);
    };

    const topIconSize = 19;

    return (
        <React.Fragment>
            <Dropzone
                onDrop={(files) =>
                    FileViewHandlers.handleOnDropFiles({
                        files,
                        activeFolderPath,
                        plugin,
                    })
                }
                noClick={true}
                onDragEnter={() => setHighlight(true)}
                onDragLeave={() => setHighlight(false)}
                onDropAccepted={() => setHighlight(false)}
                onDropRejected={() => setHighlight(false)}>
                {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} className={highlight ? 'drag-entered' : ''} style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <input {...getInputProps()} />

                        <div className="oz-explorer-container">
                            {/* Header */}
                            <div className={`oz-file-tree-header-wrapper${plugin.settings.fixedHeaderInFileList ? ' file-tree-header-fixed' : ''}`}>
                                <div className="oz-flex-container">
                                    <div className="oz-nav-action-button" style={{ marginLeft: '0px' }}>
                                        {['Horizontal', 'Vertical'].includes(plugin.settings.evernoteView) ? (
                                            <Icons.IoIosCloseCircleOutline
                                                onClick={(e) => handleGoBack(e)}
                                                size={topIconSize}
                                                aria-label="Close File Pane"
                                            />
                                        ) : (
                                            <Icons.IoIosArrowBack
                                                onClick={(e) => handleGoBack(e)}
                                                size={topIconSize}
                                                aria-label="Go Back to Folder View"
                                            />
                                        )}
                                    </div>
                                    <div className="oz-nav-buttons-right-block">
                                        {plugin.settings.revealActiveFileButton && (
                                            <div className="oz-nav-action-button">
                                                <Icons.BiCurrentLocation
                                                    onClick={() => FileViewHandlers.handleRevealActiveFileButton({ plugin })}
                                                    size={topIconSize}
                                                    aria-label="Reveal Active File"
                                                />
                                            </div>
                                        )}
                                        {plugin.settings.showFilesFromSubFoldersButton && (
                                            <div className="oz-nav-action-button">
                                                {showSubFolders ? (
                                                    <Icons.IoIosEyeOff
                                                        onClick={toggleShowSubFolders}
                                                        size={topIconSize}
                                                        aria-label="Hide Files from Sub-Folders"
                                                    />
                                                ) : (
                                                    <Icons.IoIosEye
                                                        onClick={toggleShowSubFolders}
                                                        size={topIconSize}
                                                        aria-label="Show Files from Sub-Folders"
                                                    />
                                                )}
                                            </div>
                                        )}
                                        {plugin.settings.searchFunction && (
                                            <div className="oz-nav-action-button">
                                                <Icons.IoIosSearch onClick={toggleSearchBox} size={topIconSize} aria-label="Search File by Name or Tag" />
                                            </div>
                                        )}
                                        <div className="oz-nav-action-button">
                                            <Icons.CgSortAz
                                                size={topIconSize + 2}
                                                onClick={(e) => {
                                                    FileViewHandlers.sortFileListClickHandle({ e, plugin, forceUpdate });
                                                }}
                                                aria-label="Sorting Options"
                                            />
                                        </div>
                                        <div className="oz-nav-action-button">
                                            <Icons.IoIosAddCircle
                                                onClick={(e) => Util.createNewFile(e, activeFolderPath, plugin)}
                                                size={topIconSize}
                                                aria-label="Create a Note"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {searchBoxVisible && (
                                    <div className="oz-input-container">
                                        <input
                                            type="search"
                                            placeholder="Search..."
                                            ref={searchInput}
                                            value={searchPhrase}
                                            onChange={(e) => {
                                                FileViewHandlers.handleSearch({
                                                    e,
                                                    plugin,
                                                    activeFolderPath,
                                                    setSearchPhrase,
                                                    setTreeHeader,
                                                    setOzFileList,
                                                    excludedExtensions,
                                                    excludedFolders,
                                                    focusedFolder,
                                                });
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Escape') {
                                                    e.preventDefault();
                                                    toggleSearchBox();
                                                }
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="oz-file-tree-header">{treeHeader}</div>
                            </div>
                            {/* End: Header */}

                            {/* File List */}
                            <div
                                className={`oz-file-tree-files${
                                    plugin.settings.fixedHeaderInFileList
                                        ? searchBoxVisible
                                            ? ' file-tree-files-fixed-with-search'
                                            : ' file-tree-files-fixed'
                                        : ''
                                }`}>
                                {filesToList.map((file, index) => {
                                    return (
                                        <LazyLoad height={22} key={index}>
                                            <NavFile file={file} plugin={plugin} />
                                        </LazyLoad>
                                    );
                                })}
                            </div>
                            {/* End: File List */}
                        </div>
                    </div>
                )}
            </Dropzone>
        </React.Fragment>
    );
}

/* ----------- SINGLE NAVFILE ELEMENT ----------- */

const NavFile = (props: { file: OZFile; plugin: FileTreeAlternativePlugin }) => {
    const { file, plugin } = props;

    const [ozPinnedFiles, setOzPinnedFiles] = useRecoilState(recoilState.ozPinnedFileList);
    const [activeOzFile, setActiveOzFile] = useRecoilState(recoilState.activeOZFile);

    const [hoverActive, setHoverActive] = useState<boolean>(false);

    const longPressEvents = useLongPress((e: React.TouchEvent) => {
        FileViewHandlers.triggerContextMenu({
            file,
            e,
            plugin,
            ozPinnedFiles,
            setOzPinnedFiles,
        });
    }, 500);

    useEffect(() => {
        const handleKeyDownEvent = (e: KeyboardEvent) => {
            if (e.key === 'Control' || e.key === 'Meta') {
                let el = document.querySelector(`.oz-nav-file-title[data-path="${file.path}"]`);
                if (el) plugin.app.workspace.trigger('link-hover', {}, el, file.path, file.path);
            }
        };

        if (hoverActive && plugin.settings.filePreviewOnHover) {
            document.addEventListener('keydown', handleKeyDownEvent);
            return () => {
                document.removeEventListener('keydown', handleKeyDownEvent);
            };
        }
    }, [hoverActive]);

    const FileIcon = useMemo(
        () =>
            FileViewHandlers.getFileIcon({
                file,
            }),
        [plugin.settings.iconBeforeFileName, file]
    );

    const fileDisplayName = useMemo(() => {
        return plugin.settings.showFileNameAsFullPath ? Util.getFileNameAndExtension(file.path).fileName : file.basename;
    }, [plugin.settings.showFileNameAsFullPath, file.path]);

    return (
        <div
            className={'oz-nav-file' + (activeOzFile && activeOzFile.path === file.path ? ' is-active' : '')}
            key={file.path}
            draggable
            onDragStart={(e) =>
                FileViewHandlers.dragStarted({
                    e,
                    file,
                    plugin,
                })
            }
            onClick={(e) =>
                FileViewHandlers.openFile({
                    e,
                    file,
                    plugin,
                    setActiveOzFile,
                })
            }
            onAuxClick={(e) => FileViewHandlers.onAuxClick({ e, plugin, file })}
            onContextMenu={(e) =>
                FileViewHandlers.triggerContextMenu({
                    e,
                    file,
                    plugin,
                    ozPinnedFiles,
                    setOzPinnedFiles,
                })
            }
            onMouseEnter={(e) =>
                FileViewHandlers.mouseEnteredOnFile({
                    e,
                    file,
                    plugin,
                    setHoverActive,
                })
            }
            onMouseLeave={(e) => FileViewHandlers.mouseLeftFile({ e, file, setHoverActive })}
            {...longPressEvents}>
            <div className="oz-nav-file-title" data-path={file.path}>
                <div className="oz-nav-file-title-content">
                    {plugin.settings.iconBeforeFileName && <FileIcon className="oz-nav-file-icon" size={15} />}
                    {fileDisplayName}
                </div>
                {ozPinnedFiles.some((f) => f.path === file.path) && <Icons.FaThumbtack className="oz-nav-file-tag" size={14} />}
                {file.extension !== 'md' && <span className="oz-nav-file-tag">{file.extension}</span>}
            </div>
        </div>
    );
};
