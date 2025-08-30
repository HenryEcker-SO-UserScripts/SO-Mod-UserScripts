import {modalId} from './ModMessageConstants';

export function showStandardDangerToast(message: string, transientTimeout?: number) {
    StackExchange.helpers.showToast(message, {
        type: 'danger',
        transient: true,
        transientTimeout: transientTimeout ?? 4e3
    });
}

export function getModal(){
    return document.getElementById(modalId);
}

export function openEditorModal(){
    getModal().setAttribute('aria-hidden', 'false');
    // Prevent body behind modal from scrolling
    $(document.body).css('overflow', 'hidden');
}

export function hideEditorModal(){
    getModal().setAttribute('aria-hidden', 'true');
    // Allow background scrolling again
    $(document.body).css('overflow', 'unset');
}