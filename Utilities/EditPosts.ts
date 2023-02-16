import {getFormDataFromObject} from './General';
import type {IdType} from './Types';

export function editTags(postId: IdType, tags: string, reviewTaskId?: IdType) {
    return fetch(`/posts/${postId}/edit-tags`, {
        method: 'POST',
        body: getFormDataFromObject({
            tagnames: tags,
            fkey: StackExchange.options.user.fkey,
            reviewTaskId: reviewTaskId // undefined if no review task
        })
    });
}

export function editPost(
    postId: IdType,
    revisionGuid: string,
    title: string,
    postText: string,
    tags: string,
    editComment: string,
    isCurrent = true,
    author?: string
) {
    return fetch(`/posts/${postId}/edit-submit/${revisionGuid}`, {
        method: 'POST',
        body: getFormDataFromObject({
            'is-current': isCurrent,
            'title': title,
            'post-text': postText,
            'fkey': StackExchange.options.user.fkey,
            'author': author ?? '',
            'tagnames': tags,
            'edit-comment': editComment
        })
    });
}

export function postEditorHeartbeat(postId: IdType, clientRevisionGuid: string) {
    return fetch(`/posts/${postId}/editor-heartbeat/edit`, {
        method: 'POST',
        body: getFormDataFromObject({
            fkey: StackExchange.options.user.fkey,
            clientRevisionGuid: clientRevisionGuid
        })
    });
}

export function validatePostBody(body: string, oldBody: string, isQuestion: boolean, isSuggestedEdit = false) {
    return fetch('/posts/validate-body', {
        method: 'POST',
        body: getFormDataFromObject({
            body: body,
            oldBody: oldBody,
            isQuestion: isQuestion,
            isSuggestedEdit: isSuggestedEdit,
            fkey: StackExchange.options.user.fkey
        })
    });
}