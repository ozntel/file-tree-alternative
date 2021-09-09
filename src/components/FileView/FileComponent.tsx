import React, { useState, useEffect } from 'react';
import Dropzone from 'react-dropzone';
import { TFile, Menu } from 'obsidian';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faArrowCircleLeft, faThumbtack, faSearch } from '@fortawesome/free-solid-svg-icons';
import { VaultChangeModal, FolderMoveSuggesterModal } from 'modals';
import FileTreeAlternativePlugin from 'main';
import * as Util from '../../utils/Utils';
import { viewState, activeFolderPathState, fileListState, pinnedFilesState, excludedExtensionsState } from '../../recoil/pluginState';
import { useRecoilState } from 'recoil';

interface FilesProps {
	plugin: FileTreeAlternativePlugin;
}

export function FileComponent(props: FilesProps) {
	let searchInput = React.useRef<HTMLInputElement>(null);
	const plugin = props.plugin;

	// States Coming From Main Component
	const [view, setView] = useRecoilState(viewState);
	const [fileList, setFileList] = useRecoilState(fileListState);
	const [pinnedFiles, setPinnedFiles] = useRecoilState(pinnedFilesState);
	const [activeFolderPath, setActiveFolderPath] = useRecoilState(activeFolderPathState);
	const [excludedExtensions] = useRecoilState(excludedExtensionsState);

	// Local States
	const [activeFile, setActiveFile] = useState<TFile>(null as TFile);
	const [highlight, setHighlight] = useState<boolean>(false);
	const [searchPhrase, setSearchPhrase] = useState<string>('');
	const [searchBoxVisible, setSearchBoxVisible] = useState<boolean>(false);
	const [treeHeader, setTreeHeader] = useState<string>(Util.getFolderName(activeFolderPath, plugin.app));

	// Scroll Top Once The File List is Loaded
	useEffect(() => {
		document.querySelector('div.workspace-leaf-content[data-type="file-tree-view"] > div.view-content').scrollTo(0, 0);
	});

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

	const fullHeightStyle: React.CSSProperties = { width: '100%', height: '100%' };

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
				let vaultChangeModal = new VaultChangeModal(plugin.app, file, 'rename');
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

		// Move Item
		if (!Util.internalPluginLoaded('file-explorer', plugin.app)) {
			fileMenu.addItem((menuItem) => {
				menuItem.setTitle('Move file to...');
				menuItem.setIcon('paper-plane');
				menuItem.onClick((ev: MouseEvent) => {
					let folderSuggesterModal = new FolderMoveSuggesterModal(plugin.app, file);
					folderSuggesterModal.open();
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
		if (excludedExtensions.length > 0) {
			sortedfileList = fileList.filter((file) => !excludedExtensions.contains(file.extension));
		}
		sortedfileList = sortedfileList.sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
		if (pinnedFiles.length > 0) {
			sortedfileList = sortedfileList.reduce((acc, element) => {
				if (pinnedFiles.contains(element)) return [element, ...acc];
				return [...acc, element];
			}, []);
		}
		return sortedfileList;
	};

	// Handle Plus Button - Opens Modal to Create a New File
	const createNewFile = async (e: React.MouseEvent, folderPath: string) => {
		let targetFolder = plugin.app.vault.getAbstractFileByPath(folderPath);
		if (!targetFolder) return;
		let modal = new VaultChangeModal(plugin.app, targetFolder, 'create note');
		modal.open();
	};

	// Go Back Button - Sets Main Component View to Folder
	const handleGoBack = (e: React.MouseEvent) => {
		setView('folder');
		setActiveFolderPath('');
	};

	// Toggle Search Box Visibility State
	const toggleSearchBox = (e: React.MouseEvent) => {
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
			searchFolder = '/';
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
		let mdFiles = plugin.app.vault.getMarkdownFiles();
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

	return (
		<React.Fragment>
			<div className="oz-explorer-container" style={fullHeightStyle}>
				<div className="oz-flex-container">
					<div className="nav-action-button oz-nav-action-button">
						<FontAwesomeIcon icon={faArrowCircleLeft} onClick={(e) => handleGoBack(e)} size="lg" />
					</div>
					<div className="oz-nav-buttons-right-block">
						{plugin.settings.searchFunction && (
							<div className="nav-action-button oz-nav-action-button">
								<FontAwesomeIcon icon={faSearch} onClick={toggleSearchBox} size="lg" />
							</div>
						)}
						<div className="nav-action-button oz-nav-action-button">
							<FontAwesomeIcon icon={faPlusCircle} onClick={(e) => createNewFile(e, activeFolderPath)} size="lg" />
						</div>
					</div>
				</div>

				{searchBoxVisible && (
					<div className="search-input-container oz-input-container">
						<input type="search" placeholder="Search..." ref={searchInput} value={searchPhrase} onChange={handleSearch} />
					</div>
				)}

				<div className="oz-file-tree-header">{treeHeader}</div>

				<Dropzone
					onDrop={onDrop}
					noClick={true}
					onDragEnter={() => setHighlight(true)}
					onDragLeave={() => setHighlight(false)}
					onDropAccepted={() => setHighlight(false)}
					onDropRejected={() => setHighlight(false)}>
					{({ getRootProps, getInputProps }) => (
						<div {...getRootProps()} className={highlight ? 'drag-entered' : ''} style={fullHeightStyle}>
							<input {...getInputProps()} />

							<div className="oz-file-tree-files">
								{customFiles(fileList).map((file) => {
									return (
										<div
											className="nav-file oz-nav-file"
											key={file.path}
											onClick={(e) => openFile(file, e)}
											onContextMenu={(e) => triggerContextMenu(file, e)}>
											<div
												className={'nav-file-title oz-nav-file-title' + (activeFile === file ? ' is-active' : '')}
												data-path={file.path}>
												{Util.getFileNameAndExtension(file.name).extension !== 'md' && (
													<span className="nav-file-tag">{Util.getFileNameAndExtension(file.name).extension}</span>
												)}
												<div className="nav-file-title-content">
													{Util.getFileNameAndExtension(file.name).fileName}
													{pinnedFiles.contains(file) && (
														<FontAwesomeIcon icon={faThumbtack} style={{ marginLeft: '3px', float: 'right' }} size="xs" />
													)}
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</Dropzone>
			</div>
		</React.Fragment>
	);
}
