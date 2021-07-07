import React from 'react';
import Dropzone from 'react-dropzone';
// @ts-ignore
import { TFile, Menu, Keymap } from 'obsidian';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle, faArrowCircleLeft, faThumbtack, faSearch } from '@fortawesome/free-solid-svg-icons'
import { VaultChangeModal } from '../modals';
import FileTreeAlternativePlugin from '../main';

interface FilesProps {
    plugin: FileTreeAlternativePlugin,
    fileList: TFile[],
    setFileList: Function,
    getFilesUnderPath: Function,
    activeFolderPath: string,
    setView: Function,
    pinnedFiles: TFile[],
    setPinnedFiles: Function,
    excludedExtensions: string[],
}

interface FilesState {
    activeFile: TFile,
    highlight: boolean,
    searchPhrase: string,
    searchBoxVisible: boolean,
}

export class FileComponent extends React.Component<FilesProps, FilesState>{

    state = {
        activeFile: null as TFile,
        highlight: false,
        searchPhrase: '',
        searchBoxVisible: false,
    }

    private searchInput: React.RefObject<HTMLInputElement>;

    constructor(props: FilesProps) {
        super(props);
        this.searchInput = React.createRef();
    }

    // Scroll Top Once The File List is Loaded
    componentDidMount() {
        document.querySelector('div.workspace-leaf-content[data-type="file-tree-view"] > div.view-content').scrollTo(0, 0);
    }

    // Function After an External File Dropped into Folder Name
    onDrop = (files: File[]) => {
        files.map(async file => {
            file.arrayBuffer().then(arrayBuffer => {
                this.props.plugin.app.vault.adapter.writeBinary(this.props.activeFolderPath + '/' + file.name, arrayBuffer);
            })
        })
    }

    fullHeightStyle: React.CSSProperties = { width: '100%', height: '100%' }

    // Handle Click Event on File - Allows Open with Cmd/Ctrl
    openFile = (file: TFile, e: React.MouseEvent) => {
        this.props.plugin.app.workspace.openLinkText(file.path, "/", Keymap.isModifier(e, "Mod") || 1 === e.button);
        this.setState({ activeFile: file });
    }

    // Handle Right Click Event on File - Custom Menu
    triggerContextMenu = (file: TFile, e: React.MouseEvent) => {

        const fileMenu = new Menu(this.props.plugin.app);

        // Pin - Unpin Item
        fileMenu.addItem((menuItem) => {
            menuItem.setIcon('pin');
            if (this.props.pinnedFiles.contains(file)) menuItem.setTitle('Unpin');
            else menuItem.setTitle('Pin to Top');
            menuItem.onClick((ev: MouseEvent) => {
                if (this.props.pinnedFiles.contains(file)) {
                    let newPinnedFiles = this.props.pinnedFiles.filter(pinnedFile => pinnedFile !== file);
                    this.props.setPinnedFiles(newPinnedFiles);
                } else {
                    this.props.setPinnedFiles([...this.props.pinnedFiles, file])
                }
            })
        })

        // Rename Item
        fileMenu.addItem((menuItem) => {
            menuItem.setTitle('Rename');
            menuItem.setIcon('pencil');
            menuItem.onClick((ev: MouseEvent) => {
                let vaultChangeModal = new VaultChangeModal(this.props.plugin.app, file, 'rename');
                vaultChangeModal.open()
            })
        })

        // Delete Item
        fileMenu.addItem((menuItem) => {
            menuItem.setTitle('Delete');
            menuItem.setIcon('trash');
            menuItem.onClick((ev: MouseEvent) => {
                this.props.plugin.app.vault.delete(file, true);
            })
        })

        // Trigger
        this.props.plugin.app.workspace.trigger('file-menu', fileMenu, file, 'file-explorer');
        fileMenu.showAtPosition({ x: e.pageX, y: e.pageY });
        return false;
    }

    // Files out of Md should be listed with extension badge - Md without extension
    getFileNameAndExtension = (fullName: string) => {
        var index = fullName.lastIndexOf('.');
        return {
            fileName: fullName.substring(0, index),
            extension: fullName.substring(index + 1)
        }
    }

    // Convert Full Path to Final Folder Name
    getFolderName = (folderPath: string) => {
        if (folderPath === '/') return this.props.plugin.app.vault.getName();
        let index = folderPath.lastIndexOf('/');
        if (index !== -1) return folderPath.substring(index + 1);
        return folderPath;
    }

    // Sort - Filter Files Depending on Preferences
    customFiles = (fileList: TFile[]) => {
        let sortedfileList: TFile[];
        if (this.props.excludedExtensions.length > 0) {
            sortedfileList = fileList.filter(file => !this.props.excludedExtensions.contains(file.extension));
        }
        sortedfileList = sortedfileList.sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
        if (this.props.pinnedFiles.length > 0) {
            sortedfileList = sortedfileList.reduce((acc, element) => {
                if (this.props.pinnedFiles.contains(element)) return [element, ...acc];
                return [...acc, element];
            }, [])
        }
        return sortedfileList
    }

    // Handle Plus Button - Opens Modal to Create a New File
    createNewFile = async (e: React.MouseEvent, folderPath: string) => {
        let targetFolder = this.props.plugin.app.vault.getAbstractFileByPath(folderPath);
        if (!targetFolder) return;
        let modal = new VaultChangeModal(this.props.plugin.app, targetFolder, 'create note');
        modal.open();
    }

    // Go Back Button - Sets Main Component View to Folder
    handleGoBack = (e: React.MouseEvent) => {
        this.props.setView('folder');
    }

    // Toggle Search Box Visibility State
    toggleSearchBox = (e: React.MouseEvent) => {
        this.setState({ searchPhrase: '' });
        this.setState({ searchBoxVisible: !this.state.searchBoxVisible }, () => {
            if (this.state.searchBoxVisible) this.searchInput.current.focus()
        });
        this.props.setFileList(this.props.getFilesUnderPath(this.props.activeFolderPath, this.props.plugin));
    }

    // Search Function
    handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        var searchPhrase = e.target.value
        this.setState({ searchPhrase });
        var files: TFile[] = this.props.getFilesUnderPath(this.props.activeFolderPath, this.props.plugin);
        if (!files) return;
        var filteredFiles = files.filter(file => file.name.toLowerCase().includes(searchPhrase.toLowerCase()))
        this.props.setFileList(filteredFiles);
    }

    render() {
        return (
            <React.Fragment>
                <div className="oz-explorer-container" style={this.fullHeightStyle}>

                    <div className="oz-flex-container">
                        <div className="nav-action-button oz-nav-action-button">
                            <FontAwesomeIcon icon={faArrowCircleLeft} onClick={(e) => this.handleGoBack(e)} size="lg" />
                        </div>
                        <div className="oz-nav-buttons-right-block">
                            {
                                this.props.plugin.settings.searchFunction &&
                                <div className="nav-action-button oz-nav-action-button">
                                    <FontAwesomeIcon icon={faSearch} onClick={this.toggleSearchBox} size="lg" />
                                </div>
                            }
                            <div className="nav-action-button oz-nav-action-button">
                                <FontAwesomeIcon icon={faPlusCircle} onClick={(e) => this.createNewFile(e, this.props.activeFolderPath)} size="lg" />
                            </div>
                        </div>
                    </div>

                    {
                        (this.state.searchBoxVisible) &&
                        <div className="search-input-container oz-input-container">
                            <input type="search" placeholder="Search..." ref={this.searchInput}
                                value={this.state.searchPhrase}
                                onChange={this.handleSearch}
                            />
                        </div>
                    }

                    <div className="oz-file-tree-header">
                        {this.getFolderName(this.props.activeFolderPath)}
                    </div>

                    <Dropzone
                        onDrop={this.onDrop}
                        noClick={true}
                        onDragEnter={() => this.setState({ highlight: true })}
                        onDragLeave={() => this.setState({ highlight: false })}
                        onDropAccepted={() => this.setState({ highlight: false })}
                        onDropRejected={() => this.setState({ highlight: false })}
                    >

                        {({ getRootProps, getInputProps }) => (

                            <div {...getRootProps()} className={this.state.highlight ? "drag-entered" : ''} style={this.fullHeightStyle}>

                                <input {...getInputProps()} />

                                <div className="oz-file-tree-files">
                                    {this.customFiles(this.props.fileList).map(file => {
                                        return (
                                            <div className="nav-file oz-nav-file" key={file.path} onClick={(e) => this.openFile(file, e)} onContextMenu={(e) => this.triggerContextMenu(file, e)}>
                                                <div className={'nav-file-title oz-nav-file-title' + (this.state.activeFile === file ? ' is-active' : '')} data-path={file.path}>
                                                    {
                                                        this.getFileNameAndExtension(file.name).extension !== 'md' &&
                                                        <span className="nav-file-tag">
                                                            {this.getFileNameAndExtension(file.name).extension}
                                                        </span>
                                                    }
                                                    <div className="nav-file-title-content">
                                                        {this.getFileNameAndExtension(file.name).fileName}
                                                        {
                                                            this.props.pinnedFiles.contains(file) &&
                                                            <FontAwesomeIcon icon={faThumbtack} style={{ marginLeft: '3px', float: 'right' }} size="xs" />
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                            </div>

                        )}
                    </Dropzone>

                </div>
            </React.Fragment>
        )
    }

}