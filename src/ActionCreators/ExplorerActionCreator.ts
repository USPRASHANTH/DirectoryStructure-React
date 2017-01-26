import { ActionsHub, FolderContent } from './../ActionCreators/ActionsHub';
import { StoresHub } from './../Stores/StoresHub';
import * as Q from 'q';

export class ExplorerActionCreator {

    private _invokeFolderSelectionChangedAction(folder: FolderContent) {
        let actions = ActionsHub.getInstance().getActions();
        actions.folderSelectionChangedAction(folder);

        // When a folder is selected, if is not in expanded state, expand it now.
        if (!folder.isExpanded) {
            folder.isExpanded = true;
            actions.folderExpandedAction(folder);
        }
    }

    public toggleExpandCollapseState(folderItem: FolderContent) {
        if (!folderItem.isExpanded) {
            // raise an action that indicates folder expanded.
            folderItem.isExpanded = true;
            let actions = ActionsHub.getInstance().getActions();
            actions.folderExpandedAction(folderItem);
        }
        else {
            // raise an action that indicates folder collapsed.
            folderItem.isExpanded = false;
            let actions = ActionsHub.getInstance().getActions();
            actions.folderCollapsedAction(folderItem);
        }
    }

    public selectFolder(folderItem: FolderContent) : void {
        if (!folderItem || !folderItem.isFolder) {
            return;
        }

        this._invokeFolderSelectionChangedAction(folderItem);
    }

    public navigateBack(): void {
        let actions = ActionsHub.getInstance().getActions();
        actions.navigateBackAction();
    }

    public navigateForward(): void {
        let actions = ActionsHub.getInstance().getActions();
        actions.navigateForwardAction();
    }

    public navigateUp(): void {
        let actions = ActionsHub.getInstance().getActions();
        actions.navigateUpAction();
    }

    public createFolder(folderName: string): void {
        let actions = ActionsHub.getInstance().getActions();
        actions.createFolderAction(folderName);
    }
}