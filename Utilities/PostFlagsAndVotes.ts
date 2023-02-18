import {fetchPostFormData, fetchPostFormDataBodyJsonResponse} from './General';
import type {IdType} from './Types';

export function castPostsVote(postId: IdType, voteType: IdType) {
    return fetchPostFormData(
        `/posts/${postId}/vote/${voteType}`,
        {
            fkey: StackExchange.options.user.fkey
        }
    );
}

export function reopenQuestion(postId: IdType) {
    return fetchPostFormDataBodyJsonResponse(
        `/flags/questions/${postId}/reopen/add`,
        {
            fkey: StackExchange.options.user.fkey
        }
    );
}
