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


export function deleteUser(userId: IdType, deleteReason: string, deleteReasonDetails: string) {
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