import type {IdType} from './Types';

export function fetchFullUrlFromUserId(userId: IdType): Promise<string> {
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
