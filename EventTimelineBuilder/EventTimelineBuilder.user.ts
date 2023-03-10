import {handleTimelinePage} from './pages/PostTimelinePage';
import {buildStacksController} from './EventTimelineStacksController';


function main() {
    buildStacksController();

    const pathname = window.location.pathname;
    if (pathname.endsWith('/timeline')) {
        handleTimelinePage();
    }
}

StackExchange.ready(main);