import {getVoteCounts} from 'se-ts-userscript-utilities/FlaggingAndVoting/PostVotes';
import {disableSubmitButtonAndToastErrors} from 'se-ts-userscript-utilities/StacksHelpers/StacksModal';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateValue(baseElem: JQuery, newScore: number) {
    const voteValueSpan = baseElem.find('.s-post-summary--stats-item-number:eq(0)');
    voteValueSpan.text(newScore);
    voteValueSpan.parent().addClass('bg-yellow-400');
}

async function updateVoteCounts(tabName: 'answers' | 'questions') {
    let summaryElements = undefined;
    switch (tabName) {
        case 'answers':
            summaryElements = $('div[id^="answer-id-"]');
            break;
        case 'questions':
            summaryElements = $('div[id^="question-summary-"]');
            break;
    }
    if (summaryElements === undefined) {
        return;
    }
    for (const elem of summaryElements) {
        const postId = $(elem).data('post-id');
        while (true) {
            try {
                const result = await getVoteCounts(postId);
                updateValue($(elem), Number(result.up) + Number(result.down) /* Addition because down comes as string like -2 */);
                await sleep(2000);
                break;
            } catch (e) {
                continue; // intentional infinite loop
            }
        }
    }
}

function main() {
    const tabName = <'answers' | 'questions'>new URLSearchParams(window.location.search).get('tab');
    const button = $('<button class="s-btn ml-auto s-btn__outlined s-btn__danger">Update All Votes</button>');
    button.on('click', () => {
        void disableSubmitButtonAndToastErrors(
            button,
            () => {
                return updateVoteCounts(tabName);
            }
        );
    });

    $('#js-post-summaries')
        .next()
        .addClass('d-flex ai-center')
        .append(button);
}

if (StackExchange.options.user.isModerator === true) {
    main();
}