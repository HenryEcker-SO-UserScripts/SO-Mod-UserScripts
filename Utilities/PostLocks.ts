import {getFormDataFromObject} from './General';


type LockTypeId = (
    20 | // Content Dispute
    21 | // Comment Only Lock
    22 | // Historical Lock
    23 | // Wiki Lock
    28); // Obsolete Lock

export function lockPost(postId: number | string, lockId: LockTypeId, durationInHours = 24) {
    // duration -1 can be used to permanently lock the post
    return fetch(`/admin/posts/${postId}/unlock`, {
        method: 'POST',
        body: getFormDataFromObject({
            'mod-actions': 'unlock',
            noticetype: lockId,
            duration: durationInHours,
            fkey: StackExchange.options.user.fkey
        })
    });
}

export function unlockPost(postId: number | string) {
    return fetch(`/admin/posts/${postId}/unlock`, {
        method: 'POST',
        body: getFormDataFromObject({
            'mod-actions': 'unlock',
            fkey: StackExchange.options.user.fkey
        })
    });
}