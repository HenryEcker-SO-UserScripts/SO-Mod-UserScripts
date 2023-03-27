import {fadhController} from './fadh-stimulus-components/fadh-controller';
import {getModalId} from './Globals';

function registerFlagAndRemoveController() {
    Stacks.addController(FADHNS.CONTROLLER_NAME, fadhController);
}

function clickHandler(ev: Event) {
    ev.preventDefault();
    const postId = $(ev.target).data('postid');
    const modalId = getModalId(postId);
    const existingModal = document.getElementById(modalId);
    if (existingModal !== null) {
        Stacks.showModal(existingModal);
    } else {
        $('body').append(FADHNS.NUKE_FORM.formatUnicorn({modalId: modalId, postId: postId}));
        window.setTimeout(() => {
            const modal = document.getElementById(modalId);
            Stacks.showModal(modal);
        }, 50);
    }
}


function addButtonToPosts() {
    $('.js-post-menu')
        .each((i, n) => {
            const jsPostMenu = $(n);
            const parentElement = jsPostMenu.closest('div.question,div.answer');

            // For some reason deleted questions also use the semantic CSS class deleted-answer
            const isDeleted = parentElement.hasClass('deleted-answer');
            if (isDeleted) {
                // Don't render on deleted posts
                // It'd be great to make these a disabled button, but SE uses links in the mod menu and does
                // conditional rendering instead of disabled buttons here so there aren't really any supported native styles
                return;
            }

            const postId = Number(parentElement.attr('data-questionid') ?? parentElement.attr('data-answerid'));

            const btn = $(`<a href="#" data-postid="${postId}">POST_BUTTON_LABEL</a>`);

            btn.on('click', clickHandler);

            jsPostMenu.find('>div.s-anchors').append(
                $('<div class="flex--item"></div>').append(btn)
            );
        });
}

StackExchange.ready(() => {
    if (StackExchange.options.user.isModerator) {
        registerFlagAndRemoveController();
        addButtonToPosts();
    }
});