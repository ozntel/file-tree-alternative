import { TFolder } from 'obsidian';
import React, { useState } from 'react';
import { animated, config, Spring } from 'react-spring';
import FileTreeAlternativePlugin from 'main';
import Dropzone from 'react-dropzone';
import * as Icons from 'utils/icons';
import { folderFileCountMapState, openFoldersState } from 'recoil/pluginState';
import { useRecoilState } from 'recoil';

type TreeProps = {
	open?: boolean;
	content?: string;
	onClick?: Function;
	onContextMenu?: Function;
	type?: any;
	style?: any;
	children?: any;
	folder: TFolder;
	plugin: FileTreeAlternativePlugin;
};

export default function Tree(props: TreeProps) {
	// Global States
	const [openFolders, setOpenFolders] = useRecoilState(openFoldersState);
	const [folderFileCountMap] = useRecoilState(folderFileCountMapState);

	// Local States
	const [open, setOpen] = useState<boolean>(props.open);
	const [highlight, setHightlight] = useState<boolean>(false);

	// --> Icon to be toggled between min(-) and plus(+) Each click sets openFolders Main Component state to save in settings
	const toggle = () => {
		if (props.children) {
			// Set State in Main Component for Keeping Folders Open
			if (!open) {
				setOpenFolders([...openFolders, props.folder]);
			} else {
				const newOpenFolders = openFolders.filter((folder) => {
					if (props.folder === folder) return false;
					return true;
				});
				setOpenFolders(newOpenFolders);
			}
			// Set State Open for the Folder
			setOpen(!open);
		}
	};

	// --> Function After an External File Dropped into Folder Name
	const onDrop = (files: File[]) => {
		files.map(async (file) => {
			file.arrayBuffer().then((arrayBuffer) => {
				props.plugin.app.vault.adapter.writeBinary(props.folder.path + '/' + file.name, arrayBuffer);
			});
		});
	};

	// --> Click Events
	const folderNameClickEvent = () => props.onClick();
	const folderContextMenuEvent = () => props.onContextMenu();

	// --> Icon
	const Icon = props.children ? (open ? Icons['MinusSquareO'] : Icons['PlusSquareO']) : Icons['CloseSquareO'];

	return (
		<Dropzone
			onDrop={onDrop}
			noClick={true}
			onDragEnter={() => setHightlight(true)}
			onDragLeave={() => setHightlight(false)}
			onDropAccepted={() => setHightlight(false)}
			onDropRejected={() => setHightlight(false)}>
			{({ getRootProps, getInputProps }) => (
				<div style={{ ...props.style }} className="treeview">
					<div
						{...getRootProps({ className: 'dropzone' })}
						className={'oz-folder-element' + (highlight ? ' drag-entered' : '')}
						data-path={props.folder.path}>
						<input {...getInputProps()} />

						<div style={{ width: '100%' }}>
							<div className="oz-icon-div">
								<Icon className="oz-folder-toggle" style={{ opacity: props.children ? 1 : 0.3 }} onClick={toggle} />
							</div>

							<div className="oz-folder-block" onClick={folderNameClickEvent} onContextMenu={folderContextMenuEvent}>
								<div className="oz-folder-type" style={{ marginRight: props.type ? 10 : 0 }}>
									{' '}
									{props.type}{' '}
								</div>
								<div className="oz-folder-name">{props.content}</div>
								{!open && folderFileCountMap[props.folder.path] && (
									<div className="oz-folder-count">
										<span className="nav-file-tag">{folderFileCountMap[props.folder.path]}</span>
									</div>
								)}
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
							height: open ? 'auto' : 0,
							opacity: open ? 1 : 0,
							transform: open ? 'translate3d(0px,0,0)' : 'translate3d(20px,0,0)',
						}}
						render={Contents}>
						{props.children}
					</Spring>
				</div>
			)}
		</Dropzone>
	);
}

// @ts-ignore
const Contents = ({ children, ...style }) => (
	<animated.div style={{ ...style }} className="oz-folder-contents">
		{children}
	</animated.div>
);
