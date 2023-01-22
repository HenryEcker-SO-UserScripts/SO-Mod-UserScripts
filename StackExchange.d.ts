/**
 * Modal Options can have:
 *   - title OR titleHtml but not both [required]
 *   - body OR bodyHtml but not both [required]
 *   - neither buttonLabel NOR buttonLabelHtml [optional] OR either buttonLabel OR buttonLabelHtml but not both
 */
type ShowConfirmModalOptions =
    ({ title: string; titleHtml?: never; } | { title?: never; titleHtml: string; })
    & ({ body: string; bodyHtml?: never; } | { body?: never; bodyHtml: string; })
    & ({ buttonLabel?: string; buttonLabelHtml?: never; } | { buttonLabel?: never; buttonLabelHtml: string; });


interface showToastOptions {
    dismissable: boolean;
    transient: boolean;
    useRawHtml: boolean;
    transientTimeout: number;
    type: 'info' | 'success' | 'warning' | 'danger';
}

interface SiteOptions {
    name: string;
    description: string;
    isNoticesTabEnabled: boolean;
    enableNewTagCreationWarning: boolean;
    insertSpaceAfterNameTabCompletion: boolean;
    id: number;
    cookieDomain: string;
    negativeVoteScoreFloor: null | number;
    enableSocialMediaInSharePopup: boolean;
    protocol: string;
}

interface MainSiteOptions extends SiteOptions {
    childUrl: string;
    isChildMeta: undefined;
    parentUrl: undefined;
    isMetaSite: undefined;
}

interface ChildMetaSiteOptions extends SiteOptions {
    childUrl: undefined;
    isChildMeta: boolean;
    parentUrl: string;
    isMetaSite: boolean;
}

interface StackExchangeAPI {
    options: {
        user: {
            fkey: string;
            userId: number;
            isModerator: boolean;
        };
        site: MainSiteOptions | ChildMetaSiteOptions;
    };
    helpers: {
        showConfirmModal: (options: ShowConfirmModalOptions) => Promise<boolean>;
        showToast: (message: string, options?: Partial<showToastOptions>) => void;
    };
    ready: (onReady: () => void) => void;
}

declare const StackExchange: StackExchangeAPI;