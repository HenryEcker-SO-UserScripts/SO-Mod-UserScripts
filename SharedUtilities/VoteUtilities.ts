import {getFormDataFromObject} from './FetchUtilities';

export function castPostsVote(postId: number | string, voteType: number | string) {
    return fetch(`/posts/${postId}/vote/${voteType}`, {
        method: 'POST',
        body: getFormDataFromObject({fkey: StackExchange.options.user.fkey})
    });
}