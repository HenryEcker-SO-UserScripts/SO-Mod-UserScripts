import {getFormDataFromObject} from './FetchUtilities';

export function getUserPii(userId: number | string): Promise<{
    email: string;
    name: string;
    ip: string;
}> {
    return fetch('/admin/all-pii', {
        method: 'POST',
        body: getFormDataFromObject({id: userId, fkey: StackExchange.options.user.fkey})
    })
        .then(res => res.text())
        .then(resText => {
            const html = $(resText);
            return {
                email: (html[1].children[1] as HTMLElement).innerText.trim(),
                name: (html[1].children[3] as HTMLElement).innerText.trim(),
                ip: (html[3].children[1] as HTMLElement).innerText.trim()
            };
        });
}

export function fetchFullUrlFromUserId(userId: number | string): Promise<string> {
    return fetch(`/users/${userId}`, {method: 'OPTIONS'})
        .then(res => res.url);
}

export function fetchUserIdFromHref(href: string, convertToNumber: false): undefined | string;
export function fetchUserIdFromHref(href: string, convertToNumber?: true): undefined | number;
export function fetchUserIdFromHref(href: string, convertToNumber = true): undefined | number | string {
    let match = href.match(/\/users\/(\d+)\/.*/i);
    if (match === null) {
        // Try other option
        match = href.match(/users\/account-info\/(\d+)/i);
    }
    // If match is still null or length does not match expectation return undefined
    if (match === null || match.length < 2) {
        return undefined;
    }
    if (!convertToNumber) {
        return match[1];
    }
    return Number(match[1]);
}

export function deleteUser(userId: number | string, deleteReason: string, deleteReasonDetails: string) {
    return fetch(`/admin/users/${userId}/delete`, {
        method: 'POST',
        body: getFormDataFromObject({
            fkey: StackExchange.options.user.fkey,
            deleteReason: deleteReason,
            deleteReasonDetails: deleteReasonDetails
        })
    });
}

export function annotateUser(userId: number | string, annotationDetails: string) {
    return fetch(`/admin/users/${userId}/annotate`, {
        method: 'POST',
        body: getFormDataFromObject({
            fkey: StackExchange.options.user.fkey,
            annotation: annotationDetails
        })
    });
}