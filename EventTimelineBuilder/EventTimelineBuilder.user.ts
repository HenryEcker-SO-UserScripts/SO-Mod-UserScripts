import {type ActionEvent} from '@hotwired/stimulus';


function addControllerAttributes(e: JQuery, timestamp: string) {
    /*
    TODO 1: Add additional fields
          - Link to event (as much as possible)
          - Type of event
          - Initiator of event (as much as possible)
          - Details about event (where applicable)
    TODO 2: Somehow create a unique identifier for each event (cannot use time or time hash because events can and do occur simultaneously)
          - Perhaps style already logged events differently
     */
    e.attr('data-controller', 'DATA_CONTROLLER');
    e.attr('data-action', 'click->DATA_CONTROLLER#DATA_ACTION_HANDLE_TIMESTAMP_CLICK');
    e.attr('data-DATA_CONTROLLER-timestamp-param', timestamp);
}


function handleTimelinePage() {
    $('.relativetime').each((i, n) => {
        const e = $(n);
        addControllerAttributes(
            e,
            e.attr('title')
        );
    });
}

function buildStacksController() {
    Stacks.addController(
        'DATA_CONTROLLER',
        {
            DATA_ACTION_HANDLE_TIMESTAMP_CLICK(ev: ActionEvent) {
                console.log(ev.params);
            }
        });
}

function main() {
    buildStacksController();

    const pathname = window.location.pathname;
    if (pathname.endsWith('/timeline')) {
        handleTimelinePage();
    }
}

StackExchange.ready(main);