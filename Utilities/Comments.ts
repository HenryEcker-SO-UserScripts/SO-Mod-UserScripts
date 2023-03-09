import {type IdType} from './Types';
import {fetchPostFormData, fetchPostFormDataBodyJsonResponse} from './General';

export function addComment(postId: IdType, commentText: string) {
    return fetchPostFormData(
        `/posts/${postId}/comments`, {
            fkey: StackExchange.options.user.fkey,
            comment: commentText
        });
}

export function deleteComment(commentId: IdType) {
    return fetchPostFormDataBodyJsonResponse<{ Success: boolean; }>(
        `/posts/comments/${commentId}/vote/10`, {
            fkey: StackExchange.options.user.fkey,
            sendCommentBackInMessage: false
        });
}


export function retrieveCommentEditHistory(commendId: IdType) {
    // Returns a HTML component
    return fetch(`/posts/comments/${commendId}/edit-history`)
        .then(res => res.text());
}