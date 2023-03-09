import {fetchPostFormData} from './General';
import type {IdType} from './Types';

export function getUserPii(userId: IdType): Promise<{
    email: string;
    name: string;
    ip: string;
}> {
    return fetchPostFormData(
        '/admin/all-pii',
        {id: userId, fkey: StackExchange.options.user.fkey}
    )
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

/**
 * Creates formatted detail string with columns for delete/annotation detail text
 */
export function buildDetailStringFromObject(obj: Record<string, string>, keyValueSeparator: string, recordSeparator: string, alignColumns = false) {
    const filteredObj = Object.entries(obj)
        .reduce((acc, [key, value]) => {
            if (value.length > 0) {
                acc[`${key}${keyValueSeparator}`] = value;
            }
            return acc;
        }, {} as Record<string, string>);

    const getPaddingStr = (function () {
        if (alignColumns) {
            const maxLabelLength = Math.max(...Object.keys(filteredObj).map(k => k.length));
            return function (key: string) {
                return new Array(maxLabelLength - key.length + 1).join(' ');
            };
        } else {
            return function (_: unknown) {
                return '';
            };
        }
    }());

    return Object.entries(filteredObj)
        .map(([key, value]) => `${key}${getPaddingStr(key)}${value}`)
        .join(recordSeparator);

}

export type DeleteReason = (
    'This user was created to circumvent system or moderator imposed restrictions and continues to contribute poorly' |
    'This user is no longer welcome to participate on the site'
    );

export function deleteUser(userId: IdType, deleteReason: DeleteReason, deleteReasonDetails: string) {
    return fetchPostFormData(
        `/admin/users/${userId}/delete`,
        {
            fkey: StackExchange.options.user.fkey,
            deleteReason: deleteReason,
            deleteReasonDetails: deleteReasonDetails
        }
    );
}

export function annotateUser(userId: IdType, annotationDetails: string) {
    return fetchPostFormData(
        `/admin/users/${userId}/annotate`,
        {
            fkey: StackExchange.options.user.fkey,
            annotation: annotationDetails
        }
    );
}