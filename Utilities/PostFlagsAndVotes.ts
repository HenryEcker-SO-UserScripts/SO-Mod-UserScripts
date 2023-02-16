import {getFormDataFromObject} from './General';
import type {IdType} from './Types';

export function castPostsVote(postId: IdType, voteType: IdType) {
    return fetch(`/posts/${postId}/vote/${voteType}`, {
        method: 'POST',
        body: getFormDataFromObject({fkey: StackExchange.options.user.fkey})
    });
}

export function reopenQuestion(postId: IdType) {
    return fetch(`/flags/questions/${postId}/reopen/add`, {
        method: 'POST',
        body: getFormDataFromObject({fkey: StackExchange.options.user.fkey})
    });
}
