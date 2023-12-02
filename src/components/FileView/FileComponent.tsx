import React, { useState, useEffect, useMemo } from 'react';
import Dropzone from 'react-dropzone';
import { TFile, Menu } from 'obsidian';
import * as Icons from 'utils/icons';
import { VaultChangeModal, MoveSuggestionModal, ConfirmationModal } from 'modals';
import FileTreeAlternativePlugin from 'main';
import { OZFile, eventTypes } from 'utils/types';
import * as Util from 'utils/Utils';
import * as recoilState from 'recoil/pluginState';
import { useRecoilState } from 'recoil';
import { SortType } from 'settings';
import useForceUpdate from 'hooks/ForceUpdate';
import useLongPress, { isMouseEvent } from 'hooks/useLongPress';
import { ICON } from 'FileTreeView';
import * as newFileUtils from 'utils/newFile';

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
        setOzFileList(Util.getFilesUnderPath(activeFolderPath, plugin));
    }, [showSubFolders]);

    // To focus on Search box if visible set
    useEffect(() => {
        if (searchBoxVisible) searchInput.current.focus();
    }, [searchBoxVisible]);

    // Function After an External File Dropped into Folder Name
    const onDrop = (files: File[]) => {
        files.map(async (file) => {
            file.arrayBuffer().then((arrayBuffer) => {
                plugin.app.vault.adapter.writeBinary(activeFolderPath + '/' + file.name, arrayBuffer);
            });
        });
    };

    // Sort - Filter Files Depending on Preferences
    const customFiles = (fileList: OZFile[]) => {
        let sortedfileList: OZFile[];
        // Remove Files with Excluded Extensions
        if (excludedExtensions.length > 0) {
            sortedfileList = fileList.filter((file) => !excludedExtensions.contains(file.extension));
        }
        // Remove Files from Excluded Folders
        if (excludedFolders.length > 0) {
            sortedfileList = sortedfileList.filter((file) => {
                for (let exc of excludedFolders) {
                    if (file.path.startsWith(exc)) {
                        return false;
                    }
                }
                return true;
            });
        }
        // Remove Files for Folder Note (If file name is same as parent folder name)
        if (plugin.settings.folderNote) {
            sortedfileList = sortedfileList.filter((f) => !f.isFolderNote);
        }
        // Sort File by Name or Last Content Update, moving pinned files to the front
        sortedfileList = sortedfileList.sort((a, b) => {
            if (ozPinnedFiles.contains(a) && !ozPinnedFiles.contains(b)) {
                return -1;
            } else if (!ozPinnedFiles.contains(a) && ozPinnedFiles.contains(b)) {
                return 1;
            }
            if (plugin.settings.sortReverse) {
                [a, b] = [b, a];
            }
            if (plugin.settings.sortFilesBy === 'name') {
                return plugin.settings.showFileNameAsFullPath
                    ? a.path.localeCompare(b.path, 'en', { numeric: true })
                    : a.basename.localeCompare(b.basename, 'en', { numeric: true });
            } else if (plugin.settings.sortFilesBy === 'last-update') {
                return b.stat.mtime - a.stat.mtime;
            } else if (plugin.settings.sortFilesBy === 'created') {
                return b.stat.ctime - a.stat.ctime;
            } else if (plugin.settings.sortFilesBy === 'file-size') {
                return b.stat.size - a.stat.size;
            }
        });
        return sortedfileList;
    };

    const filesToList: OZFile[] = useMemo(
        () => customFiles(ozFileList),
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
        setOzFileList(Util.getFilesUnderPath(activeFolderPath, plugin));
    };

    // Search Function
    const searchAllRegex = new RegExp('all:(.*)?');
    const searchTagRegex = new RegExp('tag:(.*)?');
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        var searchPhrase = e.target.value;
        setSearchPhrase(searchPhrase);
        var searchFolder = activeFolderPath;

        // Check Tag Regex in Search Phrase
        let tagRegexMatch = searchPhrase.match(searchTagRegex);
        if (tagRegexMatch) {
            setTreeHeader('Files with Tag');
            if (tagRegexMatch[1] === undefined || tagRegexMatch[1].replace(/\s/g, '').length === 0) {
                setOzFileList([]);
                return;
            }
            setOzFileList([...getFilesWithTag(tagRegexMatch[1])]);
            return;
        }

        // Check All Regex in Search Phrase
        let allRegexMatch = searchPhrase.match(searchAllRegex);
        if (allRegexMatch) {
            searchPhrase = allRegexMatch[1] ? allRegexMatch[1] : '';
            searchFolder = plugin.settings.allSearchOnlyInFocusedFolder ? focusedFolder.path : '/';
            setTreeHeader('All Files');
        } else {
            setTreeHeader(Util.getFolderName(activeFolderPath, plugin.app));
        }

        let getAllFiles = allRegexMatch ? true : false;
        let filteredFiles = getFilesWithName(searchPhrase, searchFolder, getAllFiles);
        setOzFileList(filteredFiles);
    };

    const getFilesWithName = (searchPhrase: string, searchFolder: string, getAllFiles?: boolean): OZFile[] => {
        var files: OZFile[] = Util.getFilesUnderPath(searchFolder, plugin, getAllFiles);
        var filteredFiles = files.filter((file) => file.basename.toLowerCase().includes(searchPhrase.toLowerCase().trimStart()));
        return filteredFiles;
    };

    const getFileTags = (f: OZFile): string[] => {
        let mdFile = plugin.app.vault.getAbstractFileByPath(f.path) as TFile;
        if (!mdFile) return [];
        let fileCache = plugin.app.metadataCache.getFileCache(mdFile);
        let fileTags: string[] = [];
        if (fileCache.tags) {
            for (let fileTag of fileCache.tags) {
                fileTags.push(fileTag.tag);
            }
        }
        if (fileCache.frontmatter && fileCache.frontmatter['tags']) {
            let tagsFM = fileCache.frontmatter['tags'];
            if (typeof tagsFM === 'string') {
                let fileFMTags = tagsFM.split(',');
                for (let i = 0; i < fileFMTags.length; i++) {
                    fileTags.push(fileFMTags[i]);
                }
            } else if (Array.isArray(tagsFM)) {
                for (let i = 0; i < tagsFM.length; i++) {
                    fileTags.push(tagsFM[i]);
                }
            }
        }
        return fileTags;
    };

    const getFilesWithTag = (searchTag: string): Set<OZFile> => {
        let filesWithTag: Set<OZFile> = new Set();
        let ozFiles = Util.getFilesUnderPath(plugin.settings.allSearchOnlyInFocusedFolder ? focusedFolder.path : '/', plugin, true);
        for (let ozFile of ozFiles) {
            let fileTags = getFileTags(ozFile);
            for (let fileTag of fileTags) {
                if (fileTag.toLowerCase().contains(searchTag.toLowerCase().trimStart())) {
                    if (!filesWithTag.has(ozFile)) filesWithTag.add(ozFile);
                }
            }
        }
        return filesWithTag;
    };

    const toggleShowSubFolders = async () => {
        plugin.settings.showFilesFromSubFolders = !showSubFolders;
        await plugin.saveSettings();
        setShowSubFolders(!showSubFolders);
    };

    const handleRevealActiveFileButton = () => {
        let event = new CustomEvent(eventTypes.revealFile, {
            detail: {
                file: plugin.app.workspace.getActiveFile(),
            },
        });
        window.dispatchEvent(event);
    };

    const sortClicked = (e: React.MouseEvent) => {
        const sortMenu = new Menu();

        const changeSortSettingTo = (newValue: SortType) => {
            plugin.settings.sortFilesBy = newValue;
            plugin.saveSettings();
            forceUpdate();
        };

        const addMenuItem = (label: string, low: string, high: string, value: SortType) => {
            sortMenu.addItem((menuItem) => {
                const order = plugin.settings.sortReverse ? `${high} to ${low}` : `${low} to ${high}`;
                menuItem.setTitle(`${label} (${order})`);
                menuItem.setIcon(value === plugin.settings.sortFilesBy ? 'checkmark' : 'spaceIcon');
                menuItem.onClick(() => changeSortSettingTo(value));
            });
        };

        addMenuItem('File Name', 'A', 'Z', 'name');
        addMenuItem('Created', 'New', 'Old', 'created');
        addMenuItem('File Size', 'Big', 'Small', 'file-size');
        addMenuItem('Last Update', 'New', 'Old', 'last-update');

        sortMenu.addSeparator();

        sortMenu.addItem((menuItem) => {
            menuItem.setTitle('Reverse Order');
            menuItem.setIcon(plugin.settings.sortReverse ? 'checkmark' : 'spaceIcon');
            menuItem.onClick(() => {
                plugin.settings.sortReverse = !plugin.settings.sortReverse;
                plugin.saveSettings();
                forceUpdate();
            });
        });

        // Trigger
        sortMenu.showAtPosition({ x: e.pageX, y: e.pageY });
    };

    const topIconSize = 19;

    return (
        <React.Fragment>
            <Dropzone
                onDrop={onDrop}
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
                                                    onClick={handleRevealActiveFileButton}
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
                                            <Icons.CgSortAz size={topIconSize + 2} onClick={sortClicked} aria-label="Sorting Options" />
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
                                            onChange={handleSearch}
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
                                    return <NavFile file={file} plugin={plugin} key={file.path} />;
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
        triggerContextMenu(file, e);
    }, 500);

    useEffect(() => {
        if (hoverActive && plugin.settings.filePreviewOnHover) {
            document.addEventListener('keydown', handleKeyDownEvent);
            return () => {
                document.removeEventListener('keydown', handleKeyDownEvent);
            };
        }
    }, [hoverActive]);

    // Handle Click Event on File - Allows Open with Cmd/Ctrl
    const openFile = (file: OZFile, e: React.MouseEvent) => {
        newFileUtils.openFile({
            file: file,
            app: plugin.app,
            newLeaf: (e.ctrlKey || e.metaKey) && !(e.shiftKey || e.altKey),
            leafBySplit: (e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey),
        });
        setActiveOzFile(file);
    };

    // Handle Right Click Event on File - Custom Menu
    const triggerContextMenu = (file: OZFile, e: React.MouseEvent | React.TouchEvent) => {
        const fileMenu = new Menu();

        // Pin - Unpin Item
        fileMenu.addItem((menuItem) => {
            menuItem.setIcon('pin');
            if (ozPinnedFiles.contains(file)) menuItem.setTitle('Unpin');
            else menuItem.setTitle('Pin to Top');
            menuItem.onClick((ev: MouseEvent) => {
                if (ozPinnedFiles.contains(file)) {
                    let newPinnedFiles = ozPinnedFiles.filter((pinnedFile) => pinnedFile !== file);
                    setOzPinnedFiles(newPinnedFiles);
                } else {
                    setOzPinnedFiles([...ozPinnedFiles, file]);
                }
            });
        });

        // Rename Item
        fileMenu.addItem((menuItem) => {
            menuItem.setTitle('Rename');
            menuItem.setIcon('pencil');
            menuItem.onClick((ev: MouseEvent) => {
                let vaultChangeModal = new VaultChangeModal(plugin, file, 'rename');
                vaultChangeModal.open();
            });
        });

        // Delete Item
        fileMenu.addItem((menuItem) => {
            menuItem.setTitle('Delete');
            menuItem.setIcon('trash');
            menuItem.onClick((ev: MouseEvent) => {
                let confirmationModal = new ConfirmationModal(
                    plugin,
                    `Are you sure you want to delete the file "${file.basename}${file.extension === 'md' ? '' : file.extension}"?`,
                    function () {
                        let deleteOption = plugin.settings.deleteFileOption;
                        let fileToDelete = plugin.app.vault.getAbstractFileByPath(file.path);
                        if (!fileToDelete) return;
                        if (deleteOption === 'permanent') {
                            plugin.app.vault.delete(fileToDelete, true);
                        } else if (deleteOption === 'system-trash') {
                            plugin.app.vault.trash(fileToDelete, true);
                        } else if (deleteOption === 'trash') {
                            plugin.app.vault.trash(fileToDelete, false);
                        }
                    }
                );
                confirmationModal.open();
            });
        });

        // Open in a New Pane
        fileMenu.addItem((menuItem) => {
            menuItem.setIcon('go-to-file');
            menuItem.setTitle('Open in a new tab');
            menuItem.onClick((ev: MouseEvent) => {
                newFileUtils.openFileInNewTab(plugin.app, file);
            });
        });

        // Open in a New Pane
        fileMenu.addItem((menuItem) => {
            menuItem.setIcon('go-to-file');
            menuItem.setTitle('Open to right');
            menuItem.onClick((ev: MouseEvent) => {
                newFileUtils.openFileInNewTabGroup(plugin.app, file);
            });
        });

        // Make a Copy Item
        fileMenu.addItem((menuItem) => {
            menuItem.setTitle('Make a copy');
            menuItem.setIcon('documents');
            menuItem.onClick((ev: MouseEvent) => {
                let fileToCopy = plugin.app.vault.getAbstractFileByPath(file.path);
                if (fileToCopy) {
                    plugin.app.vault.copy(fileToCopy as TFile, `${file.parent.path}/${file.basename} 1.${file.extension}`);
                }
            });
        });

        // Move Item
        if (!Util.internalPluginLoaded('file-explorer', plugin.app)) {
            fileMenu.addItem((menuItem) => {
                menuItem.setTitle('Move file to...');
                menuItem.setIcon('paper-plane');
                menuItem.onClick((ev: MouseEvent) => {
                    let fileMoveSuggester = new MoveSuggestionModal(plugin.app, file);
                    fileMoveSuggester.open();
                });
            });
        }

        // Trigger
        plugin.app.workspace.trigger('file-menu', fileMenu, file, 'file-explorer');
        if (isMouseEvent(e)) {
            fileMenu.showAtPosition({ x: e.pageX, y: e.pageY });
        } else {
            // @ts-ignore
            fileMenu.showAtPosition({ x: e.nativeEvent.locationX, y: e.nativeEvent.locationY });
        }
        return false;
    };

    const handleKeyDownEvent = (e: KeyboardEvent) => {
        if (e.key === 'Control' || e.key === 'Meta') {
            let el = document.querySelector(`.oz-nav-file-title[data-path="${file.path}"]`);
            if (el) plugin.app.workspace.trigger('link-hover', {}, el, file.path, file.path);
        }
    };

    const mouseEnteredOnFile = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, file: OZFile) => {
        setHoverActive(true);
        if (plugin.settings.filePreviewOnHover && (e.ctrlKey || e.metaKey)) {
            plugin.app.workspace.trigger('link-hover', {}, e.target, file.path, file.path);
        }
    };

    const mouseLeftFile = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, file: OZFile) => {
        setHoverActive(false);
    };

    // --> Dragging for File
    const dragStarted = (e: React.DragEvent<HTMLDivElement>, file: OZFile) => {
        // json to move file to folder
        e.dataTransfer.setData('application/json', JSON.stringify({ filePath: file.path }));

        // Obsidian Internal Dragmanager
        (plugin.app as any).dragManager.onDragStart(e, {
            icon: ICON,
            source: undefined,
            title: file.basename + '.' + file.extension,
            type: 'file',
            file: file,
        });

        (plugin.app as any).dragManager.dragFile(e, file, true);
    };

    // --> AuxClick (Mouse Wheel Button Action)
    const onAuxClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (e.button === 1) newFileUtils.openFileInNewTab(plugin.app, file);
    };

    const getFileIcon = () => {
        return file.extension === 'pdf'
            ? Icons.AiFillFilePdf
            : ['png', 'jpg', 'jpeg', 'svg'].contains(file.extension)
            ? Icons.AiFillFileImage
            : ['doc', 'docx'].contains(file.extension)
            ? Icons.AiFillFileWord
            : Icons.BiFile;
    };

    const FileIcon = useMemo(() => getFileIcon(), [plugin.settings.iconBeforeFileName]);

    const fileDisplayName = useMemo(() => {
        return plugin.settings.showFileNameAsFullPath ? Util.getFileNameAndExtension(file.path).fileName : file.basename;
    }, [plugin.settings.showFileNameAsFullPath, file.path]);

    return (
        <div
            className={'oz-nav-file' + (activeOzFile && activeOzFile.path === file.path ? ' is-active' : '')}
            key={file.path}
            draggable
            onDragStart={(e) => dragStarted(e, file)}
            onClick={(e) => openFile(file, e)}
            onAuxClick={onAuxClick}
            onContextMenu={(e) => triggerContextMenu(file, e)}
            onMouseEnter={(e) => mouseEnteredOnFile(e, file)}
            onMouseLeave={(e) => mouseLeftFile(e, file)}
            {...longPressEvents}>
            <div className="oz-nav-file-title" data-path={file.path}>
                <div className="oz-nav-file-title-content">
                    {plugin.settings.iconBeforeFileName && <FileIcon className="oz-nav-file-icon" size={15} />}
                    {fileDisplayName}
                </div>
                {ozPinnedFiles.contains(file) && <Icons.FaThumbtack className="oz-nav-file-tag" size={14} />}
                {file.extension !== 'md' && <span className="oz-nav-file-tag">{file.extension}</span>}
            </div>
        </div>
    );
};
