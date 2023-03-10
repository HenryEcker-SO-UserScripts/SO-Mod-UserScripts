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

export function addControllerAttributes(
    e: JQuery,
    timestamp: string,
    typeOfEvent: string,
    eventInitiator: string,
    linkToEvent: string,
    additionalEventDetails?: string
) {
    /*
    TODO 1: Somehow create a unique identifier for each event (cannot use time or time hash because events can and do occur simultaneously)
          - Perhaps style already logged events differently
     */
    e.attr('data-controller', 'DATA_CONTROLLER');
    e.attr('data-action', 'click->DATA_CONTROLLER#DATA_ACTION_HANDLE_TIMESTAMP_CLICK');
    e.attr('data-DATA_CONTROLLER-timestamp-param', timestamp);
    e.attr('data-DATA_CONTROLLER-event-param', typeOfEvent);
    e.attr('data-DATA_CONTROLLER-initiator-param', eventInitiator);
    e.attr('data-DATA_CONTROLLER-link-param', linkToEvent);
    if (additionalEventDetails !== undefined) {
        e.attr('data-DATA_CONTROLLER-details-param', additionalEventDetails);
    }
}