import React, { useState, useEffect, useMemo } from 'react';
import Dropzone from 'react-dropzone';
import { TFile } from 'obsidian';
import * as Icons from 'utils/icons';
import FileTreeAlternativePlugin from 'main';
import { OZFile } from 'utils/types';
import * as Util from 'utils/Utils';
import * as recoilState from 'recoil/pluginState';
import { useRecoilState, useRecoilValue, useSetRecoilState, SetterOrUpdater } from 'recoil';
import useForceUpdate from 'hooks/ForceUpdate';
import useLongPress from 'hooks/useLongPress';
import * as FileViewHandlers from 'components/FileView/handlers';
import LazyLoad from 'react-lazy-load';
import usePreview from 'hooks/usePreview';
import * as PreviewCache from 'utils/previewCache';

interface FilesProps {
    plugin: FileTreeAlternativePlugin;
}

export function FileComponent(props: FilesProps) {
    let searchInput = React.useRef<HTMLInputElement>(null);
    const plugin = props.plugin;

    // States Coming From Main Component
    const [_view, setView] = useRecoilState(recoilState.view);
    const [ozFileList, setOzFileList] = useRecoilState(recoilState.ozFileList);
    const [ozPinnedFiles, setOzPinnedFiles] = useRecoilState(recoilState.ozPinnedFileList);
    const activeOzFile = useRecoilValue(recoilState.activeOZFile);
    const setActiveOzFile = useSetRecoilState(recoilState.activeOZFile);
    const [activeFolderPath, setActiveFolderPath] = useRecoilState(recoilState.activeFolderPath);
    const [excludedExtensions] = useRecoilState(recoilState.excludedExtensions);
    const [excludedFolders] = useRecoilState(recoilState.excludedFolders);
    const [showSubFolders, setShowSubFolders] = useRecoilState(recoilState.showSubFolders);
    const [focusedFolder, _setFocusedFolder] = useRecoilState(recoilState.focusedFolder);
    const [selectedFiles, setSelectedFiles] = useRecoilState(recoilState.selectedFiles);
    const lastSelectedFileRef = React.useRef<string | null>(null);

    // Local States
    const [highlight, setHighlight] = useState<boolean>(false);
    const [searchPhrase, setSearchPhrase] = useState<string>('');
    const [searchBoxVisible, setSearchBoxVisible] = useState<boolean>(false);
    const [treeHeader, setTreeHeader] = useState<string>(Util.getFolderName(activeFolderPath, plugin.app));

    // Force Update
    const forceUpdate = useForceUpdate();

    // Clear selection on Escape key
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedFiles.length > 0) {
                setSelectedFiles([]);
            }
        };
        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => {
            document.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, [selectedFiles]);

    // Clear selection when active folder changes
    useEffect(() => {
        setTreeHeader(Util.getFolderName(activeFolderPath, plugin.app));
        setSelectedFiles([]);
        lastSelectedFileRef.current = null;
    }, [activeFolderPath]);

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

    // Rows only receive simple flags so they can skip re-rendering; list-wide data they need inside
    // event handlers (range select, drag, context menu) is read from this ref at event time instead
    const listStateRef = React.useRef<NavFileListState>(null);
    listStateRef.current = { filesToList, selectedFiles, ozPinnedFiles };
    const selectedPaths = useMemo(() => new Set(selectedFiles), [selectedFiles]);
    const pinnedPaths = useMemo(() => new Set(ozPinnedFiles.map((f) => f.path)), [ozPinnedFiles]);

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

    const previewMode = plugin.settings.fileListStyle === 'preview';
    const previewOptions: PreviewOptions = useMemo(
        () => ({
            lines: plugin.settings.previewLines,
            showThumbnail: plugin.settings.previewShowThumbnail,
            showTags: plugin.settings.previewShowTags,
            showAliases: plugin.settings.previewShowAliases,
            propertyKey: plugin.settings.previewPropertyKey,
            dateField: plugin.settings.sortFilesBy === 'created' ? 'ctime' : 'mtime',
        }),
        [
            plugin.settings.previewLines,
            plugin.settings.previewShowThumbnail,
            plugin.settings.previewShowTags,
            plugin.settings.previewShowAliases,
            plugin.settings.previewPropertyKey,
            plugin.settings.sortFilesBy,
        ]
    );
    // Placeholder height for rows outside of the viewport: title + text lines + date line
    const rowHeight = previewMode ? 22 + previewOptions.lines * 17 + 22 : 22;

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
                                            placeholder="Search... (a b, a | b, -a, ~a)"
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
                                {filesToList.map((file) => {
                                    return (
                                        <LazyLoad height={rowHeight} key={file.path}>
                                            <NavFile
                                                file={file}
                                                plugin={plugin}
                                                isActive={activeOzFile?.path === file.path}
                                                isSelected={selectedPaths.has(file.path)}
                                                isPinned={pinnedPaths.has(file.path)}
                                                iconBeforeFileName={plugin.settings.iconBeforeFileName}
                                                showFileNameAsFullPath={plugin.settings.showFileNameAsFullPath}
                                                previewOptions={previewMode ? previewOptions : null}
                                                listStateRef={listStateRef}
                                                setSelectedFiles={setSelectedFiles}
                                                setOzPinnedFiles={setOzPinnedFiles}
                                                setActiveOzFile={setActiveOzFile}
                                                lastSelectedFileRef={lastSelectedFileRef}
                                            />
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

type NavFileListState = { filesToList: OZFile[]; selectedFiles: string[]; ozPinnedFiles: OZFile[] };
type PreviewOptions = { lines: number; showThumbnail: boolean; showTags: boolean; showAliases: boolean; propertyKey: string; dateField: 'mtime' | 'ctime' };

// Memoized: a row only re-renders when its own props change (e.g. it becomes active/selected/pinned),
// not on every selection or active file change in the list
const NavFile = React.memo((props: {
    file: OZFile;
    plugin: FileTreeAlternativePlugin;
    isActive: boolean;
    isSelected: boolean;
    isPinned: boolean;
    iconBeforeFileName: boolean;
    showFileNameAsFullPath: boolean;
    previewOptions: PreviewOptions | null;
    listStateRef: React.MutableRefObject<NavFileListState>;
    setSelectedFiles: SetterOrUpdater<string[]>;
    setOzPinnedFiles: SetterOrUpdater<OZFile[]>;
    setActiveOzFile: SetterOrUpdater<OZFile>;
    lastSelectedFileRef: React.MutableRefObject<string | null>;
}) => {
    const {
        file,
        plugin,
        isActive,
        isSelected,
        isPinned,
        iconBeforeFileName,
        showFileNameAsFullPath,
        previewOptions,
        listStateRef,
        setSelectedFiles,
        setOzPinnedFiles,
        setActiveOzFile,
        lastSelectedFileRef,
    } = props;

    const [hoverActive, setHoverActive] = useState<boolean>(false);

    const triggerContextMenu = (e: React.MouseEvent | React.TouchEvent) => {
        const { ozPinnedFiles, selectedFiles } = listStateRef.current;
        FileViewHandlers.triggerContextMenu({
            file,
            e,
            plugin,
            ozPinnedFiles,
            setOzPinnedFiles,
            selectedFiles,
            setSelectedFiles,
        });
    };

    const longPressEvents = useLongPress(triggerContextMenu, 500);

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
        [iconBeforeFileName, file]
    );

    const fileDisplayName = useMemo(() => {
        return showFileNameAsFullPath ? Util.getFileNameAndExtension(file.path).fileName : file.basename;
    }, [showFileNameAsFullPath, file.path]);

    const handleFileClick = (e: React.MouseEvent) => {
        if (e.metaKey || e.ctrlKey) {
            // Toggle selection
            setSelectedFiles((prev) => (prev.includes(file.path) ? prev.filter((p) => p !== file.path) : [...prev, file.path]));
            lastSelectedFileRef.current = file.path;
        } else if (e.shiftKey) {
            // Range selection
            const { filesToList } = listStateRef.current;
            const anchor = lastSelectedFileRef.current || file.path;
            const anchorIndex = filesToList.findIndex((f) => f.path === anchor);
            const currentIndex = filesToList.findIndex((f) => f.path === file.path);

            if (anchorIndex !== -1 && currentIndex !== -1) {
                const start = Math.min(anchorIndex, currentIndex);
                const end = Math.max(anchorIndex, currentIndex);
                const rangePaths = filesToList.slice(start, end + 1).map((f) => f.path);
                setSelectedFiles(rangePaths);
            } else {
                setSelectedFiles([file.path]);
                lastSelectedFileRef.current = file.path;
            }
        } else {
            // Single selection & open
            setSelectedFiles([file.path]);
            lastSelectedFileRef.current = file.path;
            FileViewHandlers.openFile({
                e,
                file,
                plugin,
                setActiveOzFile,
            });
        }
    };

    return (
        <div
            className={
                'oz-nav-file' + (previewOptions ? ' oz-nav-file-preview-mode' : '') + (isActive ? ' is-active' : '') + (isSelected ? ' is-selected' : '')
            }
            key={file.path}
            draggable
            onDragStart={(e) =>
                FileViewHandlers.dragStarted({
                    e,
                    file,
                    plugin,
                    selectedFiles: listStateRef.current.selectedFiles,
                })
            }
            onClick={handleFileClick}
            onAuxClick={(e) => FileViewHandlers.onAuxClick({ e, plugin, file })}
            onContextMenu={triggerContextMenu}
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
                    {iconBeforeFileName && <FileIcon className="oz-nav-file-icon" size={15} />}
                    {fileDisplayName}
                </div>
                {isPinned && <Icons.FaThumbtack className="oz-nav-file-tag" size={14} />}
                {file.extension !== 'md' && <span className="oz-nav-file-tag">{file.extension}</span>}
            </div>
            {previewOptions && <NavFilePreview file={file} plugin={plugin} options={previewOptions} />}
        </div>
    );
});

/* ----------- NAVFILE PREVIEW (excerpt, date, tags, thumbnail) ----------- */

const NavFilePreview = (props: { file: OZFile; plugin: FileTreeAlternativePlugin; options: PreviewOptions }) => {
    const { file, plugin, options } = props;
    const preview = usePreview(file.path, plugin.app);

    const thumbnailSrc = useMemo(() => {
        if (!options.showThumbnail || !preview?.imagePath) return null;
        const imageFile = plugin.app.vault.getAbstractFileByPath(preview.imagePath);
        return imageFile instanceof TFile ? plugin.app.vault.getResourcePath(imageFile) : null;
    }, [options.showThumbnail, preview?.imagePath]);

    const timestamp = preview ? preview[options.dateField] : file.stat[options.dateField];
    const tags = options.showTags && preview ? preview.tags.slice(0, 3) : [];
    const aliases = options.showAliases && preview ? preview.aliases.slice(0, 2) : [];
    const propertyValue = preview ? PreviewCache.getPropertyValue(preview.frontmatter, options.propertyKey) : '';

    return (
        <div className="oz-nav-file-preview">
            <div className="oz-nav-file-preview-body">
                {preview?.excerpt && (
                    <div className="oz-nav-file-preview-excerpt" style={{ WebkitLineClamp: options.lines }}>
                        {preview.excerpt}
                    </div>
                )}
                <div className="oz-nav-file-preview-meta">
                    <span className="oz-nav-file-preview-date">{PreviewCache.formatPreviewDate(timestamp)}</span>
                    {propertyValue && (
                        <span className="oz-nav-file-preview-property" aria-label={options.propertyKey}>
                            {propertyValue}
                        </span>
                    )}
                    {aliases.map((alias) => (
                        <span className="oz-nav-file-preview-alias" key={'alias-' + alias} aria-label="Alias">
                            {alias}
                        </span>
                    ))}
                    {tags.map((tag) => (
                        <span className="oz-nav-file-preview-tag" key={tag}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
            {thumbnailSrc && <img className="oz-nav-file-preview-thumbnail" src={thumbnailSrc} loading="lazy" draggable={false} alt="" />}
        </div>
    );
};
