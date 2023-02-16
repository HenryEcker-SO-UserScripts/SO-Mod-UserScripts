import {getFormDataFromObject} from './General';
import type {IdType} from './Types';

export function getUserPii(userId: IdType): Promise<{
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


export function deleteUser(userId: IdType, deleteReason: string, deleteReasonDetails: string) {
    return fetch(`/admin/users/${userId}/delete`, {
        method: 'POST',
        body: getFormDataFromObject({
            fkey: StackExchange.options.user.fkey,
            deleteReason: deleteReason,
            deleteReasonDetails: deleteReasonDetails
        })
    });
}

export function annotateUser(userId: IdType, annotationDetails: string) {
    return fetch(`/admin/users/${userId}/annotate`, {
        method: 'POST',
        body: getFormDataFromObject({
            fkey: StackExchange.options.user.fkey,
            annotation: annotationDetails
        })
    });
}