import * as Reflux from 'reflux';
import { ExplorerActionCreator } from './../ActionCreators/ExplorerActionCreator';

export class ActionsHub {
    private static _instance: ActionsHub;

    public static getInstance(): ActionsHub {
        if (!this._instance) {
            this._instance = new ActionsHub();
        }

        return this._instance;
    }
    
    private _actions: any = Reflux.createActions(
        [
            "folderSelectionChangedAction",
            "folderExpandedAction",
            "folderCollapsedAction",
            "navigateBackAction",
            "navigateForwardAction",
            "navigateUpAction",
            "createFolderAction",
        ]
    );

    private _explorerActionCreator: ExplorerActionCreator = new ExplorerActionCreator();

    public getActions(): any {
        return this._actions;
    }

    public getExplorerActionCreator(): ExplorerActionCreator {
        return this._explorerActionCreator;
    }
}

export enum ChangeType {
    FolderSelectionChanged,
    FolderExpanded,
    FolderCollapsed,
    FolderContentsChanged,
    Unknown,
}

export class FolderContent {
    name: string;
    path_display: string;
    path_lower: string;
    isFolder: boolean;
    isExpanded: boolean;
    shouldFetchChildren: boolean;
    level: number;
    revision: string;
    children: FolderContent[];
}