import React from 'react';

type ConditionalRootFolderWrapper = {
	children: React.ReactElement;
	condition: boolean;
	wrapper: (children: React.ReactElement) => JSX.Element;
};

const ConditionalRootFolderWrapper: React.FC<ConditionalRootFolderWrapper> = ({ condition, wrapper, children }) =>
	condition ? wrapper(children) : children;

export default ConditionalRootFolderWrapper;
