import {isSuggestedEditQueueFull} from 'se-ts-userscript-utilities/Utilities/EditPosts';
import {type IdType} from 'se-ts-userscript-utilities/Utilities/Types';

function buildCheckEditQueueButton(postId: IdType, editHref: string) {
    const checkButton = $('<a title="Check if it is possible to suggest edits">Edit Queue</a>');
    checkButton.attr('href', editHref);
    checkButton.on('click', (ev) => {
        ev.preventDefault();
        // Warning! Sending anonymous edit requests like this can result in rate limiting.
        void isSuggestedEditQueueFull(postId)
            .then(isFull => {
                StackExchange.helpers.showToast(
                    isFull ? 'Suggested Edit Queue is full.' : 'Suggested Edit Queue is not full.',
                    {
                        type: isFull ? 'danger' : 'success',
                        transient: true,
                        transientTimeout: 3000
                    }
                );
            });
    });
    return checkButton;
}


function main() {
    const jPostMenu = $('.js-post-menu');
    const postId = jPostMenu.data('post-id');
    const editButton = jPostMenu.find('.js-edit-post');
    editButton.parent().after(
        $('<div class="flex--item"></div>')
            .append(buildCheckEditQueueButton(postId, editButton.attr('href')))
    );

}

StackExchange.ready(main);