import {attachControllerToElements} from '../Utils';
import {type ActionEvent} from '@hotwired/stimulus';


/*
TODO:
Musing... it might be much better to not store all of this for every timestamp, but rather simply add
a dedicated controller function for each page time e.g.
 click->CONTROLLER#handlePostTimelineTimestampClick, click->CONTROLLER#handleReputationEventClick, etc.

That was less information needs to be calculated and store in the DOM
and we only parse events when we need the information.
 */

// function parseTr(tr: JQuery) {
//     const typeOfEvent = tr.find('td:eq(1)').text().trim();
//     const linkToEvent = tr.find('td:eq(2) a').attr('href');
//     const eventInitiator = tr.find('td:eq(3)').html().trim();
//     const details = tr.find('td:eq(5) span').html().trim();
//     return {
//         typeOfEvent,
//         linkToEvent,
//         eventInitiator,
//         details
//     };
// }

export function handlePostTimelineTimestampClick(ev: ActionEvent) {
    console.log(ev.target);
}

export function attachControllerToPostTimelineElements() {
    attachControllerToElements($('.relativetime'), 'DATA_ACTION_POST_TIMELINE_TIMESTAMP_CLICK');
}