import React from 'react';
import Tree from 'components/FolderView/treeComponent/TreeComponent';
import FileTreeAlternativePlugin from 'main';
import ConditionalRootFolderWrapper from 'components/FolderView/ConditionalWrapper';
import { useRecoilState } from 'recoil';
import { activeFolderPathState, folderTreeState } from 'recoil/pluginState';
import { NestedFolders } from 'components/FolderView/NestedFolders';

interface FolderProps {
	plugin: FileTreeAlternativePlugin;
}

export function MainFolder(props: FolderProps) {
	const treeStyles = { color: '--var(--text-muted)', fill: '#c16ff7', width: '100%', left: 10, top: 10 };
	const plugin = props.plugin;

	// Global States
	const [activeFolderPath, setActiveFolderPath] = useRecoilState(activeFolderPathState);
	const [mainFolderTree] = useRecoilState(folderTreeState);

	const handleFolderNameClick = (folderPath: string) => {
		setActiveFolderPath(folderPath);
	};

	return (
		<div>
			<ConditionalRootFolderWrapper
				condition={plugin.settings.showRootFolder}
				wrapper={(children) => {
					return (
						<Tree
							plugin={plugin}
							content={plugin.app.vault.getName()}
							open
							style={treeStyles}
							onClick={() => handleFolderNameClick('/')}
							folder={plugin.app.vault.getRoot()}>
							{children}
						</Tree>
					);
				}}>
				{mainFolderTree && <NestedFolders plugin={plugin} folderTree={mainFolderTree} />}
			</ConditionalRootFolderWrapper>
		</div>
	);
}
