import { ExplorerStore } from './ExplorerStore';

export class StoresHub {
    private static _instance: StoresHub;
    private _explorerStore: ExplorerStore;

    public static getInstance(): StoresHub {
        if (!this._instance) {
            this._instance = new StoresHub();
        }

        return this._instance;
    }

    public getExplorerStore(): ExplorerStore {
        if (!this._explorerStore) {
            this._explorerStore = new ExplorerStore();
        }

        return this._explorerStore;
    }
}