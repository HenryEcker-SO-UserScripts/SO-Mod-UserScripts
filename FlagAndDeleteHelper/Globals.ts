export function getModalId(postId: number) {
    return FADHNS.JS_MODAL_ID.formatUnicorn({
        postId: postId
    });
}

export function removeModal(modalId: string) {
    const existingModal = document.getElementById(modalId);
    if (existingModal !== null) {
        Stacks.hideModal(existingModal);
        setTimeout(() => {
            existingModal.remove();
        }, 125);
    }
}

export type ModFlagRadioType = 'mod-flag' | 'plagiarism';

export const textAreaLimits = {
    plagiarismExplanation: {
        min: 10,
        max: 500
    },
    plagiarismSource: {
        min: 10
    },
    modFlag: {
        min: 10,
        max: 500
    },
    comment: {
        min: 15,
        max: 600
    }
};

export function isInValidationBounds(textLength: number, bounds: { min?: number; max?: number; }) {
    const min = bounds.min ?? 0;
    if (bounds.max === undefined) {
        return min <= textLength;
    }
    return min <= textLength && textLength <= bounds.max;
}