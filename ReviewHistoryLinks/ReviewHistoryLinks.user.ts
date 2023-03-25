import {fetchUserIdFromHref} from 'se-ts-userscript-utilities/Utilities/UserInfo';

function getUserLinksFromNotice(): JQuery<HTMLAnchorElement> {
    return $('.s-notice.s-notice__info').find('a[href^="/users"]') as JQuery<HTMLAnchorElement>;
}

function getReviewQueueBaseURL(): string {
    return window.location.pathname.split('/').slice(0, 3).join('/');
}

function getUserReviewQueueHistoryURL(userId: string): string {
    return `${getReviewQueueBaseURL()}/history?${new URLSearchParams({userId: userId}).toString()}`;
}

function addHistoryLinks(): void {
    getUserLinksFromNotice().after(function () {
        const n = $(this);
        const userId = fetchUserIdFromHref(n.attr('href'), false);
        if (userId === undefined) {
            return document.createDocumentFragment();
        }
        return `<span> (<a href="${getUserReviewQueueHistoryURL(userId)}" target="_blank">Review History</a>)</span>`;
    });
}

function main(): void {
    // Attach after review loads
    $(document).on('ajaxComplete', (event, {responseJSON}, {url}) => {
        if ((
                url.startsWith('/review/next-task') || url.startsWith('/review/task-reviewed/')
            ) &&
            responseJSON?.reviewTaskId !== undefined
        ) {
            addHistoryLinks();
        }
    });
}

StackExchange.ready(() => {
    // Run Function
    if (!StackExchange.options.user.isModerator) {
        return; // cannot run if not a moderator
    }
    main();
});