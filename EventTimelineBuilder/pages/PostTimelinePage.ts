import {addControllerAttributes} from '../Utils';


function parseTr(tr: JQuery) {
    const typeOfEvent = tr.find('td:eq(1)').text().trim();
    const linkToEvent = tr.find('td:eq(2) a').attr('href');
    const eventInitiator = tr.find('td:eq(3)').html().trim();
    const details = tr.find('td:eq(5) span').html().trim();
    return {
        typeOfEvent,
        linkToEvent,
        eventInitiator,
        details
    };
}

export function handleTimelinePage() {
    const timeElements = $('.relativetime');
    for (let i = 0; i < timeElements.length; i++) {
        const e = $(timeElements[i]);
        const timestamp = e.attr('title');
        const currentTr = e.closest('tr');
        const parsedTr = parseTr(currentTr);
        if (
            (parsedTr.typeOfEvent === undefined || parsedTr.typeOfEvent.length === 0) &&
            (parsedTr.linkToEvent === undefined || parsedTr.linkToEvent.length === 0)
        ) {
            const prevTr = $(timeElements[i - 1]).closest('tr');
            const {typeOfEvent:prevTypeOfEvent, linkToEvent: prevLinkToEvent} = parseTr(prevTr);
            parsedTr.typeOfEvent = `${prevTypeOfEvent} ${currentTr.find('td:eq(2)').text().trim()}`;
            parsedTr.linkToEvent = prevLinkToEvent;
        }
        addControllerAttributes(e,
            timestamp,
            parsedTr.typeOfEvent,
            parsedTr.eventInitiator,
            parsedTr.linkToEvent,
            parsedTr.details
        );
    }
}