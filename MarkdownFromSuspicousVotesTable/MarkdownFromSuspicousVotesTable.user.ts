function processUserCardTd($td: JQuery<HTMLElement>) {
    const userDisplayName = getTextFromJQueryElem($td.find('.user-details .s-btn'));
    const userLink = $td.find('a.s-block-link[href^="/users"]').attr('href');
    return `[${userDisplayName}](${userLink})`;
}

function getTextFromJQueryElem($e: JQuery<HTMLElement>) {
    return $e.text().trim();
}

function* getTableRowElements($table: JQuery<HTMLElement>) {
    for (const n of $table.find('tbody tr')) {
        const $e = $(n);
        yield {
            voter: processUserCardTd($e.find('td:eq(0)')),
            targetUser: processUserCardTd($e.find('td:eq(1)')),
            votesGiven: getTextFromJQueryElem($e.find('td:eq(2)')),
            fraudSignal: getTextFromJQueryElem($e.find('td:eq(5)'))
        };
    }
}

function buildTableMarkdown() {

    const $votesTable = $('table');

    const markdown = ['| Voter | Target User | Votes Given | Fraud Signal |'];
    markdown.push('|:---|:---|:---|:---|');

    for (const {voter, targetUser, votesGiven, fraudSignal} of getTableRowElements($votesTable)) {
        markdown.push(`| ${voter} | ${targetUser} | ${votesGiven} | ${fraudSignal} |`);
    }

    return {
        rows: markdown.length + 4,
        markdown: `\n\n${markdown.join('\n')}\n\n`
    };
}

function main() {
    const modalId = 'mfsvt-markdown-table';
    const $modalController = $('<div class="float-right" data-controller="s-modal"></div>');

    const $btn = $('<button class="s-btn s-btn__filled" data-action="s-modal#show">Create Markdown For Escalation</button>');

    $btn.on('click', () => {
        const {rows, markdown} = buildTableMarkdown();
        const $textarea = $(`#${modalId}-textarea`);
        $textarea.addClass('w100');
        $textarea.css('max-height', '65vh');
        $textarea.attr('rows', rows);
        $textarea.val(markdown);
    });

    const $modal = $(`<aside class="s-modal" data-s-modal-target="modal" id="${modalId}" tabindex="-1" role="dialog" aria-labelledby="${modalId}-title" aria-describedby="${modalId}-description" aria-hidden="true">
        <div class="s-modal--dialog w70" role="document">
            <h1 class="s-modal--header" id="${modalId}-title">Table Markdown</h1>
            <p class="s-modal--body" id="${modalId}-description"><textarea id="${modalId}-textarea"></textarea></p>
            <div class="d-flex gx8 s-modal--footer">
                <button class="flex--item s-btn" type="button" data-action="s-modal#hide">Close</button>
            </div>
            <button class="s-modal--close s-btn s-btn__muted" type="button" aria-label="Close" data-action="s-modal#hide">
                <svg aria-hidden="true" class="svg-icon iconClearSm" width="14" height="14" viewBox="0 0 14 14"><path d="M12 3.41 10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7 12 3.41Z"></path></svg>
            </button>
        </div>
    </aside>`);

    $modalController.append($btn).append($modal);
    $('#content').prepend($modalController);
}

StackExchange.ready(main);