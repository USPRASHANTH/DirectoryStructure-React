import * as React from 'react';
import * as Reflux from 'reflux';

import { ExplorerStore, ExplorerState } from './../../Stores/ExplorerStore';
import { StoresHub } from './../../Stores/StoresHub';
import { ActionsHub, FolderContent, ChangeType } from './../../ActionCreators/ActionsHub';
import { ExplorerActionCreator } from './../../ActionCreators/ExplorerActionCreator';

export function getTreeViewForFolder(folderItem: FolderContent, level: number): JSX.Element[] {
    if (!folderItem || !folderItem.children || folderItem.children.length <= 0) {
      return null;
    }

    const children = folderItem.children.map((item) => {
      return (
        <TreeViewItem key={item.path_lower} path={item.path_lower} level={level+1} children={item.children} />
      );
    });

    return children;
}

export var TreeView = React.createClass({
    mixins: [Reflux.listenTo(StoresHub.getInstance().getExplorerStore().getStore(),"onStoreChanged")],
    getInitialState: function() {
      return StoresHub.getInstance().getExplorerStore().getState();
    },
    onStoreChanged: function(explorerState: ExplorerState) {
      this.setState(explorerState);
    },
    shouldComponentUpdate: function(previousState: ExplorerState, nextState: ExplorerState) {
      if (nextState.changeType === ChangeType.FolderContentsChanged || 
          nextState.changeType === ChangeType.FolderCollapsed || 
          nextState.changeType === ChangeType.FolderExpanded) {
        return true;
      }

      return false;
    },
    render: function() {
      const treeView = getTreeViewForFolder(this.state.rootFolder, 1);
      return (
        <div>
        {treeView}
        </div>
      );
    },
});

export var TreeViewItem = React.createClass({
    propTypes: {
      path: React.PropTypes.string,
      level: React.PropTypes.number,
      children: React.PropTypes.array,
    },
    getDefaultProps: function() {
      return {
        path: "/",
        level: 1,
        children: undefined,
      };
    },
    onExpandCollapseStateToggled: function() {
        let folderItem: FolderContent = StoresHub.getInstance().getExplorerStore().getFolderContentsFromCache(this.props.path);
        if (folderItem.isFolder) {
          ActionsHub.getInstance().getExplorerActionCreator().toggleExpandCollapseState(folderItem);
        }
    },
    onFolderOpened: function() {
        let folderItem: FolderContent = StoresHub.getInstance().getExplorerStore().getFolderContentsFromCache(this.props.path);
        ActionsHub.getInstance().getExplorerActionCreator().selectFolder(folderItem);
    },
    render: function() {
       let folderItem: FolderContent = StoresHub.getInstance().getExplorerStore().getFolderContentsFromCache(this.props.path);

       if (!folderItem) {
         return null;
       }

       let children: JSX.Element[] = null;
       let subTreeCssClass = "";
       children = getTreeViewForFolder(folderItem, folderItem.level);
       if (folderItem.isFolder && !folderItem.isExpanded) {
           subTreeCssClass = "tree-view-item collapsed";
       }
       else {
           subTreeCssClass = "tree-view-item expanded";
       }

       let treeViewItemCssClass = "";
       if (folderItem.isFolder) {
           treeViewItemCssClass = "tree-view-item folder";
       }
       else {
           treeViewItemCssClass = "tree-view-item file";
       }
       
       return (
           <div>
           <div className={treeViewItemCssClass}>
           <span className={"tree-view-item-column"} onClick={this.onExpandCollapseStateToggled}>{folderItem.isExpanded ? "\\/" : "--"}</span>
           <span className={"tree-view-item-column"}>{folderItem.isFolder ? "Folder" : "File"}</span>
           <span className={"tree-view-item-column"} onClick={this.onFolderOpened}>{folderItem.name}</span>
           </div>
           <div className={subTreeCssClass}>
           {children}
           </div>
           </div>
       );
    },
});