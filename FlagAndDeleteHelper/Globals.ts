export function getModalId(postId: number) {
    return FADHNS.JS_MODAL_ID.formatUnicorn({
        postId: postId
    });
}

export type ModFlagRadioType = 'mod-flag' | 'plagiarism';