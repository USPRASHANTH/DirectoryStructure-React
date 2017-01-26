import * as React from 'react';
import * as Reflux from 'reflux';

import { ExplorerStore, ExplorerState } from './../../Stores/ExplorerStore';
import { ActionsHub, FolderContent, ChangeType } from './../../ActionCreators/ActionsHub';
import { StoresHub } from './../../Stores/StoresHub';
import { TreeView } from './../treeview/TreeView';
import { ListView } from './../listview/ListView';

export var PathComponent = React.createClass({
    mixins: [Reflux.listenTo(StoresHub.getInstance().getExplorerStore().getStore(),"onStoreChanged")],
    getInitialState: function() {
      return StoresHub.getInstance().getExplorerStore().getState();
    },
    onStoreChanged: function(explorerState: ExplorerState) {
      this.setState(explorerState);
    },
    shouldComponentUpdate: function(previousState: ExplorerState, nextState: ExplorerState) {
      if (nextState.changeType === ChangeType.FolderSelectionChanged) {
        return true;
      }

      return false;
    },
    render: function() {
        return (
            <div className={"path-component"}>
            Selected Folder Path : {this.state.selectedFolder.path_display}
            </div>
        );
    }
});

export var FolderActionsComponent = React.createClass({
    onBackButtonClicked: function() {
        ActionsHub.getInstance().getExplorerActionCreator().navigateBack();
    },
    onForwardButtonClicked: function() {
        ActionsHub.getInstance().getExplorerActionCreator().navigateForward();
    },
    onUpButtonClicked: function() {
        ActionsHub.getInstance().getExplorerActionCreator().navigateUp();
    },
    onCreateFolderButtonClicked: function() {
        let now = new Date();
        ActionsHub.getInstance().getExplorerActionCreator().createFolder(now.toLocaleTimeString());
    },
    render: function() {
        return (
            <div>
                <input type="button" value="Back" onClick={this.onBackButtonClicked} />
                <input type="button" value="Forward" onClick={this.onForwardButtonClicked} />
                <input type="button" value="Up" onClick={this.onUpButtonClicked} />
                <input type="button" value="Create Folder" onClick={this.onCreateFolderButtonClicked} />
            </div>
        );
    }
});

export var ExplorerComponent = React.createClass({
    
    render: function() {
        return (
           <div className={"explorer-view"}>
           <FolderActionsComponent />
           <PathComponent rootFolder={null} selectedFolder={null} changedFolder={null} changeType={ChangeType.Unknown} />
           <div className="explorer-left-pane">
           <TreeView rootFolder={null} selectedFolder={null} changedFolder={null} changeType={ChangeType.Unknown} />
           </div>
           <div className="explorer-right-pane">
           <ListView rootFolder={null} selectedFolder={null} changedFolder={null} changeType={ChangeType.Unknown} />
           </div>
           </div>
        );
    },
});