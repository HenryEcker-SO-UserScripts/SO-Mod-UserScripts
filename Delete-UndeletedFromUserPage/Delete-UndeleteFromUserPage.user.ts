import {castPostsVote} from '../SharedUtilities/VoteUtilities';

interface UserScriptConfig {
    deleteVoteCode: number;
    undeleteVoteCode: number;
}

const config: UserScriptConfig = {
    deleteVoteCode: 10,
    undeleteVoteCode: 11
};

// Build a button element depending on if the post is deleted or undeleted
function makeButton(btnVoteType: number, postId: string, jSummary: JQuery, jSummaryParent: JQuery): JQuery {
    const btn = $('<button class="s-btn ml-auto s-btn__outlined"></button>');
    if (btnVoteType === config.undeleteVoteCode) {
        btn.text('Undelete');
        btn.on('click', undeleteBtnClickHandler(postId, jSummary, jSummaryParent, btn));
    } else {
        btn.text('Delete');
        btn.addClass('s-btn__danger');
        btn.on('click', deleteBtnClickHandler(postId, jSummary, jSummaryParent, btn));
    }
    return btn;
}

function toggleVoteType(voteType: number) {
    if (voteType === config.undeleteVoteCode) {
        return config.deleteVoteCode;
    } else {
        return config.undeleteVoteCode;
    }
}

// Make a click handler for the btn;
function makeBtnClickHandler(postId: string, voteType: number, jSummary: JQuery, jSummaryParent: JQuery, btn: JQuery, updatePostStyle: () => void) {
    return (ev: JQuery.Event) => {
        ev.preventDefault();
        void castPostsVote(postId, voteType)
            .then((res) => {
                    if (res.status === 200) {
                        // Do something to change the style of the divs
                        updatePostStyle();
                        // Replace with a new button of opposite type
                        btn.replaceWith(
                            makeButton(
                                toggleVoteType(voteType),
                                postId,
                                jSummary,
                                jSummaryParent
                            )
                        );
                    }
                }
            );
    };
}

// Specific Click Handlers
function undeleteBtnClickHandler(postId: string, jSummary: JQuery, jSummaryParent: JQuery, btn: JQuery) {
    return makeBtnClickHandler(postId, config.undeleteVoteCode, jSummary, jSummaryParent, btn,
        () => {
            jSummaryParent.removeClass('s-post-summary__deleted');
            jSummaryParent.find('.s-post-summary--stats-item.is-deleted').remove();
        }
    );
}

function deleteBtnClickHandler(postId: string, jSummary: JQuery, jSummaryParent: JQuery, btn: JQuery) {
    return makeBtnClickHandler(postId, config.deleteVoteCode, jSummary, jSummaryParent, btn,
        () => {
            jSummaryParent.addClass('s-post-summary__deleted');
            jSummary.prepend($(`<div class="s-post-summary--stats-item is-deleted">
                            <svg aria-hidden="true" class="svg-icon iconTrashSm" width="14" height="14" viewBox="0 0 14 14">
                                <path d="M11 2a1 1 0 0 1 1 1v1H2V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h2Zm0 3H3v6c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V5Z"/>
                            </svg>Deleted</div>`));
        }
    );
}


function main() {
    // Add btns to each post
    for (const summary of $('.s-post-summary--stats.js-post-summary-stats')) {
        const jSummary = $(summary);
        const jSummaryParent = jSummary.parent();
        const isPostDeleted = jSummaryParent.hasClass('s-post-summary__deleted');
        jSummary.append(
            makeButton(
                isPostDeleted ? config.undeleteVoteCode : config.deleteVoteCode,
                jSummaryParent.attr('data-post-id'),
                jSummary,
                jSummaryParent
            )
        );
    }
}

StackExchange.ready(() => {
    // Run Function
    main();
    // Restore buttons on tab/page navigation
    $(document).on('ajaxComplete', (_0, _1, {url}) => {
        if (url.match(/users\/tab\/\d+\?tab=(answers|questions)/gi)) {
            main();
        }
    });
});