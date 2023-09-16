interface PostData {
    $link: JQuery;
    postId: string;
}

function getPostIds(): PostData[] {
    return [
        ...$('.answer-hyperlink').map((i, n) => {
            const $link = $(n);
            const url = new URL($link.attr('href'), window.location.origin);
            return {$link: $link, postId: url.hash.slice(1)};
        }).toArray(),

        ...$('.question-hyperlink').map((i, n) => {
            const $link = $(n);
            const match = $link.attr('href').match(/questions\/(\d+)\/.*/);
            return {$link: $link, postId: match[1]};
        }).toArray()
    ];
}

function fetchTimelinePage(postId: string | number) {
    return $.get(`/posts/${postId}/timeline`).then(resText => {
        return resText;
    });
}

function hasOutstandingFlags(timelineContent: string): boolean {
    return $('.event-type.flag', timelineContent).closest('tr:not(.deleted-event)').length !== 0;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

function* loopWithProgressBar<T>(arr: T[], $progressBarMountPoint: JQuery): Generator<T> {
    const $wrapper = $('<div class="s-progress"></div>');
    const $progressBar = $(`<div class="s-progress--bar" role="progressbar" aria-valuemin="${0}" aria-valuemax="${arr.length}" aria-label="current progress"></div>`);
    $progressBarMountPoint.append($wrapper.append($progressBar));
    for (let i = 0; i < arr.length; i++) {
        $progressBar.attr('aria-valuenow', i);
        $progressBar.css('width', `${i / arr.length * 100}%`);
        yield arr[i];
    }
    $wrapper.remove();
}


async function main($buttonContainer: JQuery) {
    let atLeastOneOutstandingFlag = false;
    for (const postData of loopWithProgressBar(getPostIds(), $buttonContainer)) {
        const timelineText = await fetchTimelinePage(postData.postId);
        if (hasOutstandingFlags(timelineText)) {
            postData.$link.addClass('bg-green-500'); // This could probably be better but whatever...
            atLeastOneOutstandingFlag = true;
        }
        await sleep(300);
    }

    if (!atLeastOneOutstandingFlag) {
        StackExchange.helpers.showToast('No pending flags found!', {
            type: 'info',
            transient: true,
            transientTimeout: 3000
        });
    }
}

StackExchange.ready(() => {
    const $buttonContainer = $('<div class="clear-both" style="max-width: 25vw;"></div>');
    const $button = $('<button type="button" class="s-btn s-btn__outlined my8">Search post timelines for pending flags</button>');
    $button.on('click', () => {
        void main($buttonContainer);
    });
    $('#mainbar').append($buttonContainer.append($button));
});