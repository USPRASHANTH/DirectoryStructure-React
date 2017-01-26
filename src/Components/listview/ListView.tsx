import * as React from 'react';
import * as Reflux from 'reflux';

import { ExplorerStore, ExplorerState } from './../../Stores/ExplorerStore';
import { StoresHub } from './../../Stores/StoresHub';
import { ActionsHub, FolderContent, ChangeType } from './../../ActionCreators/ActionsHub';
import { ExplorerActionCreator } from './../../ActionCreators/ExplorerActionCreator';

export function getListViewForSelectedFolder(folderItem: FolderContent): JSX.Element[] {
    if (!folderItem || !folderItem.children || folderItem.children.length <= 0) {
      return null;
    }

    const children = folderItem.children.map((item) => {
      return (
        <ListViewItem key={item.path_lower} path={item.path_lower} />
      );
    });

    return children;
}

export var ListView = React.createClass({
    mixins: [Reflux.listenTo(StoresHub.getInstance().getExplorerStore().getStore(),"onStoreChanged")],
    getInitialState: function() {
      return StoresHub.getInstance().getExplorerStore().getState();
    },
    onStoreChanged: function(explorerState: ExplorerState) {
      this.setState(explorerState);
    },
    shouldComponentUpdate: function(previousState: ExplorerState, nextState: ExplorerState) {
      if (nextState.changeType === ChangeType.FolderContentsChanged || 
          nextState.changeType === ChangeType.FolderSelectionChanged) {
        return true;
      }

      return false;
    },
    render: function() {
      const listView = getListViewForSelectedFolder(this.state.selectedFolder);
      return (
        <div>
        {listView}
        </div>
      );
    },
});

export var ListViewItem = React.createClass({
    propTypes: {
      path: React.PropTypes.string,
    },
    getDefaultProps: function() {
      return {
        path: "",
      };
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

       let cssClass = "";
       if (folderItem.isFolder) {
           cssClass = "list-view-item folder";
       }
       else {
           cssClass = "list-view-item file";
       }
       
       return (
           <div>
           <div className={cssClass}>
           <span className={"list-view-item-column"}>{folderItem.isFolder ? "Folder" : "File"}</span>
           <span className={"list-view-item-column"} onClick={this.onFolderOpened}>{folderItem.name}</span>
           </div>
           </div>
       );
    },
});