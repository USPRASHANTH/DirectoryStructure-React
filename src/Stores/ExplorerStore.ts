import * as Reflux from 'reflux';
import { ActionsHub, FolderContent, ChangeType } from './../ActionCreators/ActionsHub';

export interface ExplorerState {
    rootFolder: FolderContent;
    selectedFolder: FolderContent;
    changedFolder: FolderContent;
    changeType: ChangeType;
}

export class PathUtils {
    public static joinPath(path1: string, path2: string): string {
        if (!path1) {
            return path2;
        }

        if (!path2) {
            return path1;
        }

        let result: string = path1;
        if (path1.charAt(path1.length - 1) != '/') {
            result = path1 + "/";
        }

        result = result + path2;
        return result;
    }

    public static getPathLower(path: string): string {
        return path.toLowerCase();
    }

    public static normalizePath(path: string): string {
        if (path.charAt(path.length - 1) === '/') {
            return path.slice(0, -1);
        }

        return path;
    }

    public static areEqual(path1: string, path2: string): boolean {
        return PathUtils.normalizePath(PathUtils.getPathLower(path1)) === PathUtils.normalizePath(PathUtils.getPathLower(path2));
    }

    public static getParentPath(path: string): string {
        if (!path || path === "/") {
            return "";
        }

        let result = path;
        if (path.charAt(path.length - 1) === '/') {
            result = path.slice(0, -1);
        }

        let tempArray = path.split('/').slice(0, -1);
        if (tempArray.length === 1) {
            return "/";
        }

        result = tempArray.join('/');
        return result;
    }
}

enum NavigationAction {
    NavigatedBack,
    NavigatedForward,
    NavigatedUp,
    FolderSelected,
}

export class ExplorerStore {
    private _state: ExplorerState;
    private _store: Reflux.Store;

    private _past: string[] = [];
    private _current: string = "/";
    private _future: string[] = [];

    private _treeCache: { [id: string] : FolderContent } = { };

    private updateNavigationHistory(navigationAction: NavigationAction, newlySelectedPath: string) {
        switch (navigationAction) {
            case NavigationAction.NavigatedBack:
                if (this._past.length > 0) {
                    this._future.unshift(this._current);
                    this._current = this._past.pop();
                }
                break;
            case NavigationAction.NavigatedForward:
                if (this._future.length > 0) {
                    this._past.push(this._current);
                    this._current = this._future.shift();
                }
                break;
            case NavigationAction.NavigatedUp:
                let parentPath = PathUtils.getParentPath(this._current);
                let parentFolder = this.getFolderContentsFromCache(parentPath);
                if (parentFolder) {
                    // Navigating up is same as selecting the parent folder.
                    if (!PathUtils.areEqual(this._current, parentPath)) {
                        this._future.splice(0, this._future.length);
                        this._past.push(this._current);
                        this._current = parentPath;
                    }
                }
                break;
            case NavigationAction.FolderSelected:
                if (!PathUtils.areEqual(this._current, newlySelectedPath)) {
                    this._future.splice(0, this._future.length);
                    this._past.push(this._current);
                    this._current = newlySelectedPath;
                }
                break;
        }
    }

    private getSelectedFolderPath(): string {
        return this._current;
    }
    
    constructor() {

        let rootFolder = {
                name: "/",
                path_display: "/",
                path_lower: "/",
                isFolder: true,
                isExpanded: true,
                shouldFetchChildren: true,
                level: 1,
                revision: undefined,
                children: undefined,
            } as FolderContent;

        this._state = {
            rootFolder: rootFolder,
            selectedFolder: rootFolder,
            changedFolder: rootFolder,
            changeType: ChangeType.Unknown,
        };

        let that = this;
        this._store = Reflux.createStore({
            getInitialState: function() {
                return that._state;
            },
            getState: function() {
                return that._state;
            },
            updateNavigationHistory: function(navigationAction: NavigationAction, currentSelectedPath: string) {
                that.updateNavigationHistory(navigationAction, currentSelectedPath);
            },
            getSelectedFolderPath: function(): string {
                return that.getSelectedFolderPath();
            },
            setState: function(newState: ExplorerState) {
                that._state = newState;
            },
            init: function() {
                let actions = ActionsHub.getInstance().getActions();
                this.listenTo(actions.folderSelectionChangedAction, this.onFolderSelectionChangedAction);
                this.listenTo(actions.folderCollapsedAction, this.onFolderCollapsedAction);
                this.listenTo(actions.folderExpandedAction, this.onFolderExpandedAction);

                this.listenTo(actions.navigateBackAction, this.onNavigateBackAction);
                this.listenTo(actions.navigateForwardAction, this.onNavigateForwardAction);
                this.listenTo(actions.navigateUpAction, this.onNavigateUpAction);
                this.listenTo(actions.createFolderAction, this.onCreateFolderAction);
            },
            doesKeyExist: function(path: string): boolean {
                return !!that._treeCache[path];
            },
            getFolderContentsFromCache: function(path: string): FolderContent {
                return that.getFolderContentsFromCache(path);
            },
            updateTreeCache: function(folderContent: FolderContent) {
                that._treeCache[folderContent.path_lower] = folderContent;
            },
            onFolderCollapsedAction: function(folderContent: FolderContent) {
                // Update the cache entry from expand to collapse
                this.updateTreeCache(folderContent);
                this.setState({
                    rootFolder: this.getState().rootFolder,
                    selectedFolder: this.getState().selectedFolder,
                    changedFolder: folderContent,
                    changeType: ChangeType.FolderCollapsed,
                } as ExplorerState);

                this.trigger(this.getState());
            },
            onFolderExpandedAction: function(folderContent: FolderContent) {
                // Update the cache entry from collapse to expand
                this.updateTreeCache(folderContent);
                this.setState({
                    rootFolder: this.getState().rootFolder,
                    selectedFolder: this.getState().selectedFolder,
                    changedFolder: folderContent,
                    changeType: ChangeType.FolderExpanded,
                } as ExplorerState);
                
                this.trigger(this.getState());
            },
            onFolderSelectionChangedAction: function(folderContent: FolderContent) {
                this.updateNavigationHistory(NavigationAction.FolderSelected, folderContent.path_lower);

                // No need to update the cache entry
                this.setState({
                    rootFolder: this.getState().rootFolder,
                    selectedFolder: folderContent,
                    changedFolder: folderContent,
                    changeType: ChangeType.FolderSelectionChanged,
                } as ExplorerState);

                this.trigger(this.getState());
            },
            onNavigateBackAction: function() {
                let selectedFolder = this.getState().selectedFolder;
                this.updateNavigationHistory(NavigationAction.NavigatedBack, selectedFolder.path_lower);
                let targetFolderPath = this.getSelectedFolderPath();
                let targetFolder = this.getFolderContentsFromCache(targetFolderPath);

                if (targetFolder) {
                    // No need to update the cache entry
                    this.setState({
                        rootFolder: this.getState().rootFolder,
                        selectedFolder: targetFolder,
                        changedFolder: targetFolder,
                        changeType: ChangeType.FolderSelectionChanged,
                    } as ExplorerState);

                    this.trigger(this.getState());
                }
            },
            onNavigateForwardAction: function() {
                let selectedFolder = this.getState().selectedFolder;
                this.updateNavigationHistory(NavigationAction.NavigatedForward, selectedFolder.path_lower);
                let targetFolderPath = this.getSelectedFolderPath();
                let targetFolder = this.getFolderContentsFromCache(targetFolderPath);

                if (targetFolder) {
                    // No need to update the cache entry
                    this.setState({
                        rootFolder: this.getState().rootFolder,
                        selectedFolder: targetFolder,
                        changedFolder: targetFolder,
                        changeType: ChangeType.FolderSelectionChanged,
                    } as ExplorerState);

                    this.trigger(this.getState());
                }
            },
            onNavigateUpAction: function() {
                let selectedFolder = this.getState().selectedFolder;
                this.updateNavigationHistory(NavigationAction.NavigatedUp, selectedFolder.path_lower);
                let parentPath = this.getSelectedFolderPath();
                let parentFolder = this.getFolderContentsFromCache(parentPath);

                if (parentFolder) {
                    // No need to update the cache entry
                    this.setState({
                        rootFolder: this.getState().rootFolder,
                        selectedFolder: parentFolder,
                        changedFolder: parentFolder,
                        changeType: ChangeType.FolderSelectionChanged,
                    } as ExplorerState);

                    this.trigger(this.getState());
                }
            },
            onCreateFolderAction: function(folderName: string) {
                // If the folder is not already present in selectedFolder,
                // create a child entry for selectedFolder with folderName.
                // Also, add an entry for newly created folder in tree cache.
                let selectedFolder = this.getState().selectedFolder;
                let newFolderPath_display = PathUtils.joinPath(selectedFolder.path_display, folderName);
                let newFolderPath_lower = PathUtils.getPathLower(newFolderPath_display);

                if (!this.doesKeyExist(newFolderPath_lower)) {
                    let newFolder = {
                        name: folderName,
                        path_display: newFolderPath_display,
                        path_lower: newFolderPath_lower,
                        isFolder: true,
                        isExpanded: false,
                        shouldFetchChildren: false,
                        children: undefined,
                    } as FolderContent;

                    if (selectedFolder.children && selectedFolder.children.length > 0) {
                        selectedFolder.children.push(newFolder);
                    }
                    else {
                        selectedFolder.children = [newFolder];
                    }

                    this.updateTreeCache(newFolder);
                    this.updateTreeCache(selectedFolder);

                    this.setState({
                        rootFolder: this.getState().rootFolder,
                        selectedFolder: selectedFolder,
                        changedFolder: selectedFolder,
                        changeType: ChangeType.FolderContentsChanged,
                    } as ExplorerState);

                    this.trigger(this.getState());
                }
            },
        });
    }

    public getFolderContentsFromCache(path: string): FolderContent {
        return this._treeCache[path];
    }

    public getState(): ExplorerState {
        return this._state;
    }

    public getStore(): Reflux.Store {
        return this._store;
    }
}