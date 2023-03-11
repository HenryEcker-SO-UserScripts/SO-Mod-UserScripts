export type TimelineEventType =
    'asked'
    | 'answer'
    | 'question-deleted'
    | 'answer-deleted'
    | 'flag'
    | 'flag cleared'
    | 'made wiki'
    | 'wiki removed'
    | 'edit'
    | 'comment'
    | 'accept-vote'
    | 'question-protected';

export function convertEventTypeToHTMLBadge(t: TimelineEventType) {
    switch (t) {
        case 'accept-vote':
            return '<span class="event-type vote">accept</span>';
        case 'answer':
            return '<span class="event-type answer-type">answer</span>';
        case 'comment':
            return '<span class="event-type comment">comment</span>';
        case 'flag':
            return '<span class="event-type flag">flag</span>';
        default:
            return `<span class="event-type history">${t}</span>`;
    }
}

export function addEventToGlobalTimeline(
    timestamp: string,
    typeOfEvent: string,
    eventInitiator: string,
    linkToEvent: string,
    additionalEventDetails?: string
) {
    console.log('Attempting to add', {
        timestamp,
        typeOfEvent,
        eventInitiator,
        linkToEvent,
        additionalEventDetails
    });
}

export function attachControllerToElements(elements: JQuery, clickFn: string) {
    elements.each((i, n) => {
        const e = $(n);
        e.attr('data-controller', 'DATA_CONTROLLER');
        e.attr('data-action', `click->DATA_CONTROLLER#${clickFn}`);
    });
}