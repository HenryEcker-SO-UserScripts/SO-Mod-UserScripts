export function showStandardDangerToast(message: string, transientTimeout?: number) {
    StackExchange.helpers.showToast(message, {
        type: 'danger',
        transient: true,
        transientTimeout: transientTimeout ?? 4e3
    });
}

interface StandardShowConfirmModalProps {
    title: StackExchange.ModalType['title'];
    bodyHtml: StackExchange.ModalType['bodyHtml'];
    buttonLabel: StackExchange.ModalType['buttonLabel'];
}

export function showStandardConfirmModal({title, bodyHtml, buttonLabel}: StandardShowConfirmModalProps) {
    return StackExchange.helpers.showConfirmModal({
        title: title,
        bodyHtml: bodyHtml,
        buttonLabel: buttonLabel,
        closeOthers: false
    });
}