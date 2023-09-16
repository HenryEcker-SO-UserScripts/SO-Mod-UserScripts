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

class ProgressBar {
    private readonly $progressBar: JQuery;
    private readonly $wrapper: JQuery;
    private readonly min: number;
    private readonly max: number;

    constructor($mountPoint: JQuery, min: number, max: number) {
        this.min = min;
        this.max = max;
        this.$progressBar = $(`<div class="s-progress--bar" role="progressbar" aria-valuemin="${this.min}" aria-valuemax="${this.max}" aria-label="current progress"></div>`);
        this.$wrapper = $('<div class="s-progress"></div>');

        $mountPoint.append(
            this.$wrapper
                .append(this.$progressBar)
        );
    }

    update(currentValue: number) {
        this.$progressBar.attr('aria-valuenow', currentValue);
        this.$progressBar.css('width', `${(currentValue - this.min) / this.max * 100}%`);
    }

    destroy() {
        this.$wrapper.remove();
    }
}

function* loopWithProgressBar<T>(arr: T[], $progressBarMountPoint: JQuery): Generator<T> {
    const bar = new ProgressBar($progressBarMountPoint, 0, arr.length);
    for (let i = 0; i < arr.length; i++) {
        bar.update(i);
        yield arr[i];
    }
    bar.destroy();
}


async function main($buttonContainer:JQuery) {
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