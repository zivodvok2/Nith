import { action, makeObservable, observable } from 'mobx';
import { tabs_title } from '@/constants/bot-contents';
import { onWorkspaceResize } from '@/external/bot-skeleton';
import { getSetting, storeSetting } from '@/utils/settings';
import RootStore from './root-store';

export default class BlocklyStore {
    root_store: RootStore;

    // Observables
    is_loading = false;
    active_tab = tabs_title.WORKSPACE;
    workspace_content = ''; // New observable for workspace content

    constructor(root_store: RootStore) {
        makeObservable(this, {
            is_loading: observable,
            active_tab: observable,
            workspace_content: observable, // Register workspace_content as an observable
            setLoading: action,
            setActiveTab: action,
            setWorkspaceContent: action, // Register setWorkspaceContent as an action
        });
        this.root_store = root_store;
    }

    // Action to set the active tab
    setActiveTab = (tab: string): void => {
        this.active_tab = tab;
        storeSetting('active_tab', this.active_tab);
    };

    // Action to update workspace content
    setWorkspaceContent = (content: string): void => {
        this.workspace_content = content;
    };

    // Getter for workspace content (optional)
    getWorkspaceContent = (): string => {
        return this.workspace_content;
    };

    // Resize workspace when active tab is workspace
    setContainerSize = (): void => {
        if (this.active_tab === tabs_title.WORKSPACE) {
            onWorkspaceResize();
        }
    };

    // Lifecycle hook: Add resize event listener
    onMount = (): void => {
        window.addEventListener('resize', this.setContainerSize);
    };

    // Retrieve cached active tab from settings
    getCachedActiveTab = (): void => {
        if (getSetting('active_tab')) {
            this.active_tab = getSetting('active_tab');
        }
    };

    // Lifecycle hook: Remove resize event listener
    onUnmount = (): void => {
        window.removeEventListener('resize', this.setContainerSize);
    };

    // Action to update the loading state
    setLoading = (is_loading: boolean): void => {
        this.is_loading = is_loading;
    };
  
}

