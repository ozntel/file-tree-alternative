import React, { useState, useEffect, useMemo } from 'react';
import Dropzone from 'react-dropzone';
import { TFile, Menu } from 'obsidian';
import * as Icons from 'utils/icons';
import { VaultChangeModal, MoveSuggestionModal } from 'modals';
import FileTreeAlternativePlugin, { eventTypes } from 'main';
import * as Util from 'utils/Utils';
import * as recoilState from 'recoil/pluginState';
import { useRecoilState } from 'recoil';
import { SortType } from 'settings';
import { ObsidianVaultConfig } from 'utils/types';

interface FilesProps {
    plugin: FileTreeAlternativePlugin;
}

export function FileComponent(props: FilesProps) {
    let searchInput = React.useRef<HTMLInputElement>(null);
    const plugin = props.plugin;

    // States Coming From Main Component
    const [_view, setView] = useRecoilState(recoilState.view);
    const [fileList, setFileList] = useRecoilState(recoilState.fileList);
    const [pinnedFiles, setPinnedFiles] = useRecoilState(recoilState.pinnedFiles);
    const [activeFolderPath, setActiveFolderPath] = useRecoilState(recoilState.activeFolderPath);
    const [excludedExtensions] = useRecoilState(recoilState.excludedExtensions);
    const [excludedFolders] = useRecoilState(recoilState.excludedFolders);
    const [showSubFolders, setShowSubFolders] = useRecoilState(recoilState.showSubFolders);
    const [focusedFolder, _setFocusedFolder] = useRecoilState(recoilState.focusedFolder);
    const [activeFile, setActiveFile] = useRecoilState(recoilState.activeFile);

    // Local States
    const [highlight, setHighlight] = useState<boolean>(false);
    const [searchPhrase, setSearchPhrase] = useState<string>('');
    const [searchBoxVisible, setSearchBoxVisible] = useState<boolean>(false);
    const [treeHeader, setTreeHeader] = useState<string>(Util.getFolderName(activeFolderPath, plugin.app));

    // Force Update
    const [viewStatus, setViewStatus] = useState<number>(0);
    const forceUpdate = () => setViewStatus(viewStatus + 1);

    // Folder Name Update once Active Folder Path Change
    useEffect(() => setTreeHeader(Util.getFolderName(activeFolderPath, plugin.app)), [activeFolderPath]);

    // File List Update once showSubFolders change
    useEffect(() => {
        setFileList(Util.getFilesUnderPath(activeFolderPath, plugin));
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

    // Handle Click Event on File - Allows Open with Cmd/Ctrl
    const openFile = (file: TFile, e: React.MouseEvent) => {
        Util.openInternalLink(e, file.path, plugin.app);
        setActiveFile(file);
    };

    // Handle Right Click Event on File - Custom Menu
    const triggerContextMenu = (file: TFile, e: React.MouseEvent) => {
        const fileMenu = new Menu(plugin.app);

        // Pin - Unpin Item
        fileMenu.addItem((menuItem) => {
            menuItem.setIcon('pin');
            if (pinnedFiles.contains(file)) menuItem.setTitle('Unpin');
            else menuItem.setTitle('Pin to Top');
            menuItem.onClick((ev: MouseEvent) => {
                if (pinnedFiles.contains(file)) {
                    let newPinnedFiles = pinnedFiles.filter((pinnedFile) => pinnedFile !== file);
                    setPinnedFiles(newPinnedFiles);
                } else {
                    setPinnedFiles([...pinnedFiles, file]);
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
                plugin.app.vault.delete(file, true);
            });
        });

        // Open in a New Pane
        fileMenu.addItem((menuItem) => {
            menuItem.setIcon('go-to-file');
            menuItem.setTitle('Open in a new pane');
            menuItem.onClick((ev: MouseEvent) => {
                Util.openInNewPane(plugin.app, file.path);
            });
        });

        // Make a Copy Item
        fileMenu.addItem((menuItem) => {
            menuItem.setTitle('Make a copy');
            menuItem.setIcon('documents');
            menuItem.onClick((ev: MouseEvent) => {
                plugin.app.vault.copy(file, `${file.parent.path}/${file.basename} 1.${file.extension}`);
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
        fileMenu.showAtPosition({ x: e.pageX, y: e.pageY });
        return false;
    };

    // Sort - Filter Files Depending on Preferences
    const customFiles = (fileList: TFile[]) => {
        let sortedfileList: TFile[];
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
            sortedfileList = sortedfileList.filter((f) => f.basename !== f.parent.name);
        }
        // Sort File by Name or Last Content Update, moving pinned files to the front
        sortedfileList = sortedfileList.sort((a, b) => {
            if (pinnedFiles.contains(a) && !pinnedFiles.contains(b)) {
                return -1;
            } else if (!pinnedFiles.contains(a) && pinnedFiles.contains(b)) {
                return 1;
            } else if (plugin.settings.sortFilesBy === 'name') {
                return a.name.localeCompare(b.name, 'en', { numeric: true });
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

    const filesToList: TFile[] = useMemo(() => customFiles(fileList), [excludedFolders, excludedExtensions, pinnedFiles, fileList, viewStatus]);

    // Handle Plus Button - Opens Modal to Create a New File
    const createNewFile = async (e: React.MouseEvent, folderPath: string) => {
        let targetFolder = plugin.app.vault.getAbstractFileByPath(folderPath);
        if (!targetFolder) return;
        let modal = new VaultChangeModal(plugin, targetFolder, 'create note');
        modal.open();
    };

    // Go Back Button - Sets Main Component View to Folder
    const handleGoBack = (e: React.MouseEvent) => {
        setView('folder');
        setActiveFolderPath('');
    };

    // Toggle Search Box Visibility State
    const toggleSearchBox = () => {
        setSearchPhrase('');
        setSearchBoxVisible(!searchBoxVisible);
        setFileList(Util.getFilesUnderPath(activeFolderPath, plugin));
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
                setFileList([]);
                return;
            }
            setFileList([...getFilesWithTag(tagRegexMatch[1])]);
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
        setFileList(filteredFiles);
    };

    const getFilesWithName = (searchPhrase: string, searchFolder: string, getAllFiles?: boolean): TFile[] => {
        var files: TFile[] = Util.getFilesUnderPath(searchFolder, plugin, getAllFiles);
        var filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchPhrase.toLowerCase().trimStart()));
        return filteredFiles;
    };

    const getFilesWithTag = (searchTag: string): Set<TFile> => {
        let filesWithTag: Set<TFile> = new Set();
        let mdFiles = Util.getFilesUnderPath(plugin.settings.allSearchOnlyInFocusedFolder ? focusedFolder.path : '/', plugin, true);
        for (let mdFile of mdFiles) {
            let fileCache = plugin.app.metadataCache.getFileCache(mdFile);
            if (fileCache.tags) {
                for (let fileTag of fileCache.tags) {
                    if (fileTag.tag.toLowerCase().contains(searchTag.toLowerCase().trimStart())) {
                        if (!filesWithTag.has(mdFile)) filesWithTag.add(mdFile);
                    }
                }
            }
        }
        return filesWithTag;
    };

    const mouseEnteredOnFile = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, file: TFile) => {
        if (plugin.settings.filePreviewOnHover) {
            plugin.app.workspace.trigger('link-hover', {}, e.target, file.path, file.path);
        }
    };

    const toggleShowSubFolders = async () => {
        plugin.settings.showFilesFromSubFolders = !showSubFolders;
        await plugin.saveSettings();
        setShowSubFolders(!showSubFolders);
    };

    const handleRevealActiveFileButton = () => {
        let event = new CustomEvent(eventTypes.revealFile, { detail: { file: plugin.app.workspace.getActiveFile() } });
        window.dispatchEvent(event);
    };

    const sortClicked = (e: React.MouseEvent) => {
        const sortMenu = new Menu(plugin.app);

        const changeSortSettingTo = (newValue: SortType) => {
            plugin.settings.sortFilesBy = newValue;
            plugin.saveSettings();
            forceUpdate();
        };

        sortMenu.addItem((menuItem) => {
            menuItem.setTitle('File Name (A to Z)');
            menuItem.onClick((ev: MouseEvent) => {
                changeSortSettingTo('name');
            });
        });

        sortMenu.addItem((menuItem) => {
            menuItem.setTitle('Created (New to Old)');
            menuItem.onClick((ev: MouseEvent) => {
                changeSortSettingTo('created');
            });
        });

        sortMenu.addItem((menuItem) => {
            menuItem.setTitle('File Size (Small to Big)');
            menuItem.onClick((ev: MouseEvent) => {
                changeSortSettingTo('file-size');
            });
        });

        sortMenu.addItem((menuItem) => {
            menuItem.setTitle('Last Update (New to Old)');
            menuItem.onClick((ev: MouseEvent) => {
                changeSortSettingTo('last-update');
            });
        });

        // Trigger
        plugin.app.workspace.trigger('sort-menu', sortMenu);
        sortMenu.showAtPosition({ x: e.pageX, y: e.pageY });
        return false;
    };

    // --> Dragging for File
    const dragStarted = (e: React.DragEvent<HTMLDivElement>, file: TFile) => {
        // @ts-ignore
        const obsidianConfig = plugin.app.vault.config as ObsidianVaultConfig;
        const linkText = ['absolute', 'relative'].contains(obsidianConfig.newLinkFormat) ? file.parent.path + '/' + file.basename : file.basename;
        const link = obsidianConfig.useMarkdownLinks ? `[${file.basename}](${encodeURI(linkText + '.' + file.extension)})` : `[[${linkText}]]`;
        e.dataTransfer.setData('text/plain', link);
    };

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
                                    <div className="nav-action-button oz-nav-action-button">
                                        {plugin.settings.evernoteView ? (
                                            <Icons.IoIosCloseCircleOutline onClick={(e) => handleGoBack(e)} size={20} aria-label="Close File Pane" />
                                        ) : (
                                            <Icons.IoIosArrowBack onClick={(e) => handleGoBack(e)} size={20} aria-label="Go Back to Folder View" />
                                        )}
                                    </div>
                                    <div className="oz-nav-buttons-right-block">
                                        {plugin.settings.revealActiveFileButton && (
                                            <div className="nav-action-button oz-nav-action-button">
                                                <Icons.IoIosLocate onClick={handleRevealActiveFileButton} size={20} aria-label="Reveal Active File" />
                                            </div>
                                        )}
                                        {plugin.settings.showFilesFromSubFoldersButton && (
                                            <div className="nav-action-button oz-nav-action-button">
                                                {showSubFolders ? (
                                                    <Icons.IoIosEyeOff onClick={toggleShowSubFolders} size={20} aria-label="Hide Files from Sub-Folders" />
                                                ) : (
                                                    <Icons.IoIosEye onClick={toggleShowSubFolders} size={20} aria-label="Show Files from Sub-Folders" />
                                                )}
                                            </div>
                                        )}
                                        {plugin.settings.searchFunction && (
                                            <div className="nav-action-button oz-nav-action-button">
                                                <Icons.IoIosSearch onClick={toggleSearchBox} size={20} aria-label="Search File by Name or Tag" />
                                            </div>
                                        )}
                                        <div className="nav-action-button oz-nav-action-button">
                                            <Icons.FaSort size={20} onClick={sortClicked} aria-label="Sorting Options" />
                                        </div>
                                        <div className="nav-action-button oz-nav-action-button">
                                            <Icons.IoIosAddCircle
                                                onClick={(e) => createNewFile(e, activeFolderPath)}
                                                size={20}
                                                aria-label="Create a Note"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {searchBoxVisible && (
                                    <div className="search-input-container oz-input-container">
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
                                    return (
                                        <div
                                            className="nav-file oz-nav-file"
                                            key={file.path}
                                            draggable
                                            onDragStart={(e) => dragStarted(e, file)}
                                            onClick={(e) => openFile(file, e)}
                                            onContextMenu={(e) => triggerContextMenu(file, e)}
                                            onMouseEnter={(e) => mouseEnteredOnFile(e, file)}>
                                            <div
                                                className={'nav-file-title oz-nav-file-title' + (activeFile === file ? ' is-active' : '')}
                                                data-path={file.path}>
                                                <div className="nav-file-title-content">
                                                    {Util.getFileNameAndExtension(file.name).fileName}
                                                    {pinnedFiles.contains(file) && (
                                                        <Icons.FaThumbtack style={{ marginLeft: '3px', float: 'right', marginTop: '4px' }} size={14} />
                                                    )}
                                                </div>
                                                {Util.getFileNameAndExtension(file.name).extension !== 'md' && (
                                                    <span className="nav-file-tag">{Util.getFileNameAndExtension(file.name).extension}</span>
                                                )}
                                            </div>
                                        </div>
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
