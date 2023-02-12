import {getFormDataFromObject} from './General';

export function castPostsVote(postId: number | string, voteType: number | string) {
    return fetch(`/posts/${postId}/vote/${voteType}`, {
        method: 'POST',
        body: getFormDataFromObject({fkey: StackExchange.options.user.fkey})
    });
}

export function reopenQuestion(postId: number | string) {
    return fetch(`/flags/questions/${postId}/reopen/add`, {
        method: 'POST',
        body: getFormDataFromObject({fkey: StackExchange.options.user.fkey})
    });
}
